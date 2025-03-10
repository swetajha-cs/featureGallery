// CompactLightbox.js
class CompactLightbox {
  constructor(options = {}) {
    // Default options
    this.options = {
      images: [], // Array of image objects: [{src: 'image.jpg', alt: 'Image description'}]
      container: document.body, // Where to append the gallery
      thumbnailSize: 200, // Size of thumbnails in pixels
      fadeSpeed: 200, // Animation speed in milliseconds
      gap: 10, // Gap between thumbnails
      ...options
    };

    // Initialize state
    this.isOpen = false;
    this.currentIndex = 0;

    // Create gallery and lightbox
    this.init();
  }

  init() {
    // Create styles
    this.injectStyles();

    // Create gallery container
    this.createGallery();

    // Create lightbox elements
    this.createLightbox();

    // Add event listeners
    this.addListeners();
  }

  injectStyles() {
    const css = `
      .cl-gallery {
        display: flex;
        flex-wrap: wrap;
        gap: ${this.options.gap}px;
      }
      .cl-thumbnail {
        position: relative;
        overflow: hidden;
        width: ${this.options.thumbnailSize}px;
        height: ${this.options.thumbnailSize}px;
        cursor: pointer;
      }
      .cl-thumbnail:before {
        content: "";
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
      }
      .cl-thumbnail:hover:before {
        opacity: 1;
      }
      .cl-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cl-search-btn {
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 2;
      }
      .cl-thumbnail:hover .cl-search-btn {
        opacity: 1;
        top: 50%;
      }
      .cl-lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        opacity: 0;
        transition: opacity ${this.options.fadeSpeed}ms ease;
        z-index: 9999;
        display: none;
      }
      .cl-image-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 90%;
        max-height: 90vh;
      }
      .cl-image-container img {
        max-width: 100%;
        max-height: 80vh;
        display: block;
      }
      .cl-close, .cl-prev, .cl-next {
        position: absolute;
        background: rgba(5, 5, 5, 0.8);
        border: none;
        padding: 10px 15px;
        cursor: pointer;
        color: #fff;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cl-close {
        top: 15px;
        right: 15px;
        font-size: 24px;
        width: 40px;
        height: 40px;
      }
      .cl-prev, .cl-next {
        top: 50%;
        transform: translateY(-50%);
        width: 45px;
        height: 45px;
      }
      .cl-prev {
        left: 15px;
      }
      .cl-next {
        right: 15px;
      }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  createGallery() {
    // Create gallery container
    this.gallery = document.createElement("div");
    this.gallery.className = "cl-gallery";

    // Create thumbnails for each image
    this.options.images.forEach((image, index) => {
      const thumbnail = document.createElement("div");
      thumbnail.className = "cl-thumbnail";

      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt || "";

      const searchBtn = document.createElement("button");
      searchBtn.className = "cl-search-btn";
      searchBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 488.4 488.4" fill="#ffffff">
          <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
            s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
            S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
            S381.9,104.65,381.9,203.25z"/>
        </svg>
      `;

      // Attach event to open lightbox
      searchBtn.addEventListener("click", () => this.show(index));
      thumbnail.addEventListener("click", (e) => {
        if (e.target === thumbnail) this.show(index);
      });

      thumbnail.appendChild(img);
      thumbnail.appendChild(searchBtn);
      this.gallery.appendChild(thumbnail);
    });

    this.options.container.appendChild(this.gallery);
  }

  createLightbox() {
    // Main container
    this.lightbox = document.createElement("div");
    this.lightbox.className = "cl-lightbox";

    // Image container
    this.imageContainer = document.createElement("div");
    this.imageContainer.className = "cl-image-container";

    // Close button
    this.closeBtn = document.createElement("button");
    this.closeBtn.className = "cl-close";
    this.closeBtn.innerHTML = "×";

    // Previous button
    this.prevBtn = document.createElement("button");
    this.prevBtn.className = "cl-prev";
    this.prevBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    `;

    // Next button
    this.nextBtn = document.createElement("button");
    this.nextBtn.className = "cl-next";
    this.nextBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    `;

    // Assemble lightbox
    this.lightbox.appendChild(this.imageContainer);
    this.lightbox.appendChild(this.closeBtn);
    this.lightbox.appendChild(this.prevBtn);
    this.lightbox.appendChild(this.nextBtn);
    document.body.appendChild(this.lightbox);
  }

  addListeners() {
    // Close button
    this.closeBtn.addEventListener("click", () => this.hide());

    // Navigation buttons
    this.prevBtn.addEventListener("click", () => this.previous());
    this.nextBtn.addEventListener("click", () => this.next());

    // Background click
    this.lightbox.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.hide();
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;

      if (e.key === "Escape") this.hide();
      if (e.key === "ArrowLeft") this.previous();
      if (e.key === "ArrowRight") this.next();
    });
  }

  show(index) {
    this.currentIndex = index;
    this.isOpen = true;

    // Create and load image
    const img = document.createElement("img");
    img.src = this.options.images[this.currentIndex].src;
    img.alt = this.options.images[this.currentIndex].alt || "";

    this.imageContainer.innerHTML = "";
    this.imageContainer.appendChild(img);

    // Show with fade in
    this.lightbox.style.display = "block";
    setTimeout(() => {
      this.lightbox.style.opacity = "1";
    }, 10);

    this.updateNavigation();
  }

  hide() {
    this.isOpen = false;
    this.lightbox.style.opacity = "0";

    setTimeout(() => {
      this.lightbox.style.display = "none";
    }, this.options.fadeSpeed);
  }

  previous() {
    if (this.currentIndex > 0) {
      this.show(this.currentIndex - 1);
    }
  }

  next() {
    if (this.currentIndex < this.options.images.length - 1) {
      this.show(this.currentIndex + 1);
    }
  }

  updateNavigation() {
    this.prevBtn.style.display = this.currentIndex > 0 ? "block" : "none";
    this.nextBtn.style.display =
      this.currentIndex < this.options.images.length - 1 ? "block" : "none";
  }
}
