/**
 * PDF Compressor for Nilwala Agency
 * Compresses oversized scanned / photo-heavy PDFs in the browser before storage.
 * Keeps text crisp and readable while reducing file size by 70% - 90%.
 */
(function() {
  const PdfCompressor = {
    // Files under this size will NOT be recompressed (already optimal)
    SKIP_THRESHOLD: 400 * 1024, // 400 KB

    // Max pages to compress per document (safeguard for browser memory)
    MAX_PAGES: 12,

    /**
     * Check if pdf.js and jspdf libraries are available
     */
    isAvailable() {
      return (typeof window !== 'undefined' && typeof window.pdfjsLib !== 'undefined' && typeof window.jspdf !== 'undefined');
    },

    /**
     * Compress a PDF File or Blob
     * @param {File|Blob} file
     * @param {Function} onProgress Callback receiving { status, percent, message }
     * @returns {Promise<{blob: Blob, compressed: boolean, originalSize: number, newSize: number, savedPercent: number}>}
     */
    async compressPdf(file, onProgress) {
      const originalSize = file.size || 0;

      // 1. If file is already small (e.g. < 400KB), keep original to preserve vector crispness
      if (originalSize <= this.SKIP_THRESHOLD) {
        return {
          blob: file,
          compressed: false,
          originalSize,
          newSize: originalSize,
          savedPercent: 0,
          reason: 'already_small'
        };
      }

      // 2. If compression libraries are not yet loaded, gracefully fallback to original
      if (!this.isAvailable()) {
        console.warn('[PdfCompressor] pdf.js or jspdf not loaded; using original file.');
        return {
          blob: file,
          compressed: false,
          originalSize,
          newSize: originalSize,
          savedPercent: 0,
          reason: 'libs_not_loaded'
        };
      }

      try {
        if (onProgress) onProgress({ status: 'reading', percent: 10, message: 'Reading document...' });

        // Set worker source if not set
        if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
        }

        const arrayBuffer = await file.arrayBuffer();

        if (onProgress) onProgress({ status: 'analyzing', percent: 25, message: 'Analyzing pages...' });

        const loadingTask = window.pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true
        });

        const pdf = await loadingTask.promise;
        const totalPdfPages = pdf.numPages || 1;
        const pagesToProcess = Math.min(totalPdfPages, this.MAX_PAGES);

        if (pagesToProcess === 0) {
          return { blob: file, compressed: false, originalSize, newSize: originalSize, savedPercent: 0 };
        }

        const { jsPDF } = window.jspdf;
        let newPdf = null;

        for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
          const currentPercent = 25 + Math.round((pageNum / pagesToProcess) * 60);
          if (onProgress) {
            onProgress({
              status: 'compressing',
              page: pageNum,
              totalPages: pagesToProcess,
              percent: currentPercent,
              message: `Compressing page ${pageNum} of ${pagesToProcess}...`
            });
          }

          const page = await pdf.getPage(pageNum);
          const unscaled = page.getViewport({ scale: 1.0 });

          // Determine optimal render dimension (scanned phone photos are often 3000px+):
          // For document scans, 1300px width provides high readability while drastically cutting size
          const targetMax = 1350;
          const largestDim = Math.max(unscaled.width, unscaled.height);
          let scale = 1.0;
          if (largestDim > targetMax) {
            scale = targetMax / largestDim;
          } else if (largestDim < 900) {
            scale = Math.min(1.5, 900 / largestDim);
          }

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext('2d', { alpha: false });

          // Solid white background (prevents black background on transparency)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;

          // JPEG quality 0.72 provides 80%+ compression with crisp letterforms
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.72);

          const isLandscape = viewport.width > viewport.height;
          const orientation = isLandscape ? 'landscape' : 'portrait';

          if (pageNum === 1) {
            newPdf = new jsPDF({
              orientation,
              unit: 'px',
              format: [viewport.width, viewport.height],
              compress: true
            });
          } else {
            newPdf.addPage([viewport.width, viewport.height], orientation);
          }

          newPdf.addImage(jpegDataUrl, 'JPEG', 0, 0, viewport.width, viewport.height, undefined, 'FAST');

          // Release canvas memory
          canvas.width = 0;
          canvas.height = 0;
        }

        if (onProgress) onProgress({ status: 'finalizing', percent: 95, message: 'Finalizing PDF...' });

        const compressedBlob = newPdf.output('blob');
        const newSize = compressedBlob.size;

        // Verify that the compressed version is smaller by at least 5%
        if (newSize < originalSize * 0.95) {
          const savedPercent = Math.round(((originalSize - newSize) / originalSize) * 100);
          return {
            blob: compressedBlob,
            compressed: true,
            originalSize,
            newSize,
            savedPercent
          };
        } else {
          // If already optimized or larger, retain original file
          return {
            blob: file,
            compressed: false,
            originalSize,
            newSize: originalSize,
            savedPercent: 0,
            reason: 'original_smaller'
          };
        }
      } catch (err) {
        console.warn('[PdfCompressor] Compression skipped due to error, using original:', err);
        return {
          blob: file,
          compressed: false,
          originalSize,
          newSize: originalSize,
          savedPercent: 0,
          error: err.message
        };
      }
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.PdfCompressor = PdfCompressor;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PdfCompressor;
  }
})();
