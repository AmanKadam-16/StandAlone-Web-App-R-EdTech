// Mock Educational Content Data
// Replace with your actual data structure and paths
// Paths should be relative to index.html
const R_EDIFICATION_CONTENT = {
    classes: [
        {
            id: 'class5',
            name: 'Class 5',
            icon: '🎒', // Emoji or path to an icon image
            description: 'Foundation courses for Class 5 students.',
            units: [
                {
                    id: 'c5_math',
                    name: 'Mathematics',
                    icon: '🔢',
                    description: 'Exploring numbers, shapes, and basic operations.',
                    chapters: [
                        {
                            id: 'c5_math_ch1',
                            name: 'Chapter 1: Number Sense',
                            icon: '🧐',
                            description: 'Understanding numbers and their properties.',
                            videos: [
                                { id: 'c5m1v1', title: 'Introduction to Large Numbers', duration: '12:35', videoPath: './content/class5/mathematics/unit1_numbers/chapter1_intro/video1.mp4', thumbnailPath: './content/class5/mathematics/unit1_numbers/chapter1_intro/thumb1.jpg' },
                                { id: 'c5m1v2', title: 'Place Value and Face Value', duration: '10:15', videoPath: './content/class5/mathematics/unit1_numbers/chapter1_intro/video2.mp4', thumbnailPath: './content/class5/mathematics/unit1_numbers/chapter1_intro/thumb2.jpg' },
                            ]
                        },
                        {
                            id: 'c5_math_ch2',
                            name: 'Chapter 2: Basic Operations',
                            icon: '➕',
                            description: 'Addition, subtraction, multiplication, and division.',
                            videos: [
                                { id: 'c5m2v1', title: 'Mastering Addition', duration: '15:00', videoPath: './content/class5/mathematics/unit1_numbers/chapter2_operations/video1.mp4', thumbnailPath: './content/class5/mathematics/unit1_numbers/chapter2_operations/thumb1.jpg' },
                            ]
                        }
                    ]
                },
                {
                    id: 'c5_science',
                    name: 'Science',
                    icon: '🔬',
                    description: 'Discovering the world around us.',
                    chapters: [
                        {
                            id: 'c5_sci_ch1',
                            name: 'Chapter 1: Living Things',
                            icon: '🌱',
                            description: 'Characteristics of living organisms.',
                            videos: [
                                { id: 'c5s1v1', title: 'What are Living Things?', duration: '11:50', videoPath: './content/class5/science/unit1_living/chapter1_intro/video1.mp4', thumbnailPath: './content/class5/science/unit1_living/chapter1_intro/thumb1.jpg' },
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'class6',
            name: 'Class 6',
            icon: '📚',
            description: 'Intermediate courses for Class 6 students.',
            units: [
                {
                    id: 'c6_history',
                    name: 'History',
                    icon: '🏛️',
                    description: 'Journeys through time and civilizations.',
                    chapters: [
                        {
                            id: 'c6_hist_ch1',
                            name: 'Chapter 1: Ancient Civilizations',
                            icon: '🏺',
                            description: 'Exploring early human societies.',
                            videos: [
                                { id: 'c6h1v1', title: 'The Indus Valley Civilization', duration: '18:22', videoPath: './content/class6/history/unit1_ancient/chapter1_indus/video1.mp4', thumbnailPath: './content/class6/history/unit1_ancient/chapter1_indus/thumb1.jpg' },
                            ]
                        }
                    ]
                }
            ]
        },
        // Add more classes, units, chapters, and videos as needed
    ]
};

class REdificationApp {
    constructor() {
        // DOM Elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.appContainer = document.getElementById('appContainer');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.pageContent = document.getElementById('pageContent');
        this.dynamicContent = document.getElementById('dynamicContent');
        this.breadcrumbsContainer = document.getElementById('breadcrumbsContainer');
        this.errorDisplay = document.getElementById('errorDisplay');
        
        this.videoPlayerModal = document.getElementById('videoPlayerModal');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.currentVideoTitleModal = document.getElementById('currentVideoTitleModal');
        this.closePlayerBtnModal = document.getElementById('closePlayerBtnModal');

        // App State
        this.currentView = 'home'; // 'home', 'class', 'unit', 'chapter', 'license', 'about', 'help'
        this.selectedClassId = null;
        this.selectedUnitId = null;
        this.selectedChapterId = null;
        this.currentVideo = null;

        this.contentData = R_EDIFICATION_CONTENT; // Load the mock data

        this.init();
    }

    init() {
        this.setupSecurityMeasures();
        this.setupEventListeners();
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Simulate initial loading
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            this.appContainer.style.display = 'flex'; // Use flex for main app container
            this.navigateTo('home');
        }, 1500); // Adjust timeout as needed
    }

    setupSecurityMeasures() {
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
        // Disable drag and drop for images and links (superficial)
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === "IMG" || e.target.tagName === "A") {
                e.preventDefault();
            }
        });
    }

    setupEventListeners() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
        });

        this.closePlayerBtnModal.addEventListener('click', () => this.closeVideoPlayer());
        this.videoPlayerModal.addEventListener('click', (e) => {
            if (e.target === this.videoPlayerModal) {
                this.closeVideoPlayer();
            }
        });
        
        this.videoPlayer.addEventListener('loadedmetadata', () => this.restoreVideoPosition());
        this.videoPlayer.addEventListener('timeupdate', () => this.saveVideoPosition());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.videoPlayerModal.style.display === 'block') {
                this.closeVideoPlayer();
            }
        });
    }

    navigateTo(page, params = {}) {
        this.currentView = page;
        this.errorDisplay.innerHTML = ''; // Clear previous errors

        // Reset selections when navigating to broader views
        if (page === 'home') {
            this.selectedClassId = null;
            this.selectedUnitId = null;
            this.selectedChapterId = null;
        }
        if (params.classId) this.selectedClassId = params.classId;
        if (params.unitId) this.selectedUnitId = params.unitId;
        if (params.chapterId) this.selectedChapterId = params.chapterId;
        
        // Update active nav button
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page || (page.startsWith('class') && btn.dataset.page === 'home'));
        });

        this.updateBreadcrumbs();
        this.renderCurrentView();
    }

    renderCurrentView() {
        this.dynamicContent.innerHTML = ''; // Clear previous content

        switch (this.currentView) {
            case 'home':
                this.renderClassesView();
                break;
            case 'class':
                this.renderUnitsView(this.selectedClassId);
                break;
            case 'unit':
                this.renderChaptersView(this.selectedClassId, this.selectedUnitId);
                break;
            case 'chapter':
                this.renderVideosView(this.selectedClassId, this.selectedUnitId, this.selectedChapterId);
                break;
            case 'license':
                this.renderStaticPage('License Agreement', this.getLicenseContent());
                break;
            case 'about':
                this.renderStaticPage('About R-Edification', this.getAboutContent());
                break;
            case 'help':
                this.renderStaticPage('Help & Instructions', this.getHelpContent());
                break;
            default:
                this.dynamicContent.innerHTML = '<h2>Page Not Found</h2><p>The requested content could not be located.</p>';
        }
    }

    updateBreadcrumbs() {
        this.breadcrumbsContainer.innerHTML = '';
        let crumbs = [];

        const homeCrumb = this.createBreadcrumbItem('Home', 'home');
        crumbs.push(homeCrumb);

        if (this.selectedClassId) {
            const classObj = this.contentData.classes.find(c => c.id === this.selectedClassId);
            if (classObj) {
                const classCrumb = this.createBreadcrumbItem(classObj.name, 'class', { classId: classObj.id });
                crumbs.push(classCrumb);
            }
        }
        if (this.selectedUnitId && this.selectedClassId) {
            const classObj = this.contentData.classes.find(c => c.id === this.selectedClassId);
            const unitObj = classObj?.units.find(u => u.id === this.selectedUnitId);
            if (unitObj) {
                const unitCrumb = this.createBreadcrumbItem(unitObj.name, 'unit', { classId: classObj.id, unitId: unitObj.id });
                crumbs.push(unitCrumb);
            }
        }
        if (this.selectedChapterId && this.selectedUnitId && this.selectedClassId) {
            const classObj = this.contentData.classes.find(c => c.id === this.selectedClassId);
            const unitObj = classObj?.units.find(u => u.id === this.selectedUnitId);
            const chapterObj = unitObj?.chapters.find(ch => ch.id === this.selectedChapterId);
            if (chapterObj) {
                const chapterCrumb = this.createBreadcrumbItem(chapterObj.name, 'chapter', { classId: classObj.id, unitId: unitObj.id, chapterId: chapterObj.id });
                crumbs.push(chapterCrumb);
            }
        }
        
        // For static pages, ensure 'Home' is always present, then the page name
        if (['license', 'about', 'help'].includes(this.currentView)) {
            const pageName = this.currentView.charAt(0).toUpperCase() + this.currentView.slice(1);
            crumbs = [homeCrumb, this.createBreadcrumbItem(pageName, this.currentView, {}, true)]; // last one active
        }


        crumbs.forEach((crumb, index) => {
            if (index > 0) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '>';
                this.breadcrumbsContainer.appendChild(separator);
            }
            // Mark the last crumb as active if it's the current view context
            if (index === crumbs.length - 1 && 
                (crumb.dataset.page === this.currentView || (this.currentView === 'home' && crumb.dataset.page === 'home'))) {
                crumb.classList.add('active');
                crumb.onclick = null; // Remove click for active crumb
            }
            this.breadcrumbsContainer.appendChild(crumb);
        });
    }
    
    createBreadcrumbItem(text, page, params = {}, isActive = false) {
        const item = document.createElement('a'); // Use <a> for semantics, style as button/link
        item.textContent = text;
        item.href = '#'; // Prevent page reload
        item.className = 'breadcrumb-item focusable';
        item.dataset.page = page;
        item.tabIndex = 0;
        if (isActive) {
            item.classList.add('active');
        } else {
            item.onclick = (e) => {
                e.preventDefault();
                this.navigateTo(page, params);
            };
            item.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateTo(page, params);
                }
            };
        }
        return item;
    }

    renderClassesView() {
        const title = document.createElement('h1');
        title.textContent = 'Welcome to R-Edification Learning';
        this.dynamicContent.appendChild(title);
        
        const subTitle = document.createElement('h2');
        subTitle.textContent = 'Select a Class';
        this.dynamicContent.appendChild(subTitle);

        const grid = document.createElement('div');
        grid.className = 'grid-container';

        if (!this.contentData.classes || this.contentData.classes.length === 0) {
            this.renderEmptyState('No classes available at the moment.');
            return;
        }

        this.contentData.classes.forEach(classObj => {
            const card = this.createCard(classObj.name, classObj.icon, classObj.description, () => {
                this.navigateTo('class', { classId: classObj.id });
            });
            grid.appendChild(card);
        });
        this.dynamicContent.appendChild(grid);
    }

    renderUnitsView(classId) {
        const classObj = this.contentData.classes.find(c => c.id === classId);
        if (!classObj) {
            this.showError(`Class with ID ${classId} not found.`);
            this.navigateTo('home'); // Go back home
            return;
        }

        const title = document.createElement('h2');
        title.textContent = `Units in ${classObj.name}`;
        this.dynamicContent.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid-container';

        if (!classObj.units || classObj.units.length === 0) {
            this.renderEmptyState(`No units found in ${classObj.name}.`);
            return;
        }

        classObj.units.forEach(unitObj => {
            const card = this.createCard(unitObj.name, unitObj.icon, unitObj.description, () => {
                this.navigateTo('unit', { classId: classId, unitId: unitObj.id });
            });
            grid.appendChild(card);
        });
        this.dynamicContent.appendChild(grid);
    }

    renderChaptersView(classId, unitId) {
        const classObj = this.contentData.classes.find(c => c.id === classId);
        const unitObj = classObj?.units.find(u => u.id === unitId);
        if (!unitObj) {
            this.showError(`Unit with ID ${unitId} not found.`);
            this.navigateTo('class', {classId: classId});
            return;
        }
        
        const title = document.createElement('h2');
        title.textContent = `Chapters in ${unitObj.name} (${classObj.name})`;
        this.dynamicContent.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid-container';

        if (!unitObj.chapters || unitObj.chapters.length === 0) {
            this.renderEmptyState(`No chapters found in ${unitObj.name}.`);
            return;
        }

        unitObj.chapters.forEach(chapterObj => {
            const card = this.createCard(chapterObj.name, chapterObj.icon, chapterObj.description, () => {
                this.navigateTo('chapter', { classId: classId, unitId: unitId, chapterId: chapterObj.id });
            });
            grid.appendChild(card);
        });
        this.dynamicContent.appendChild(grid);
    }

    renderVideosView(classId, unitId, chapterId) {
        const classObj = this.contentData.classes.find(c => c.id === classId);
        const unitObj = classObj?.units.find(u => u.id === unitId);
        const chapterObj = unitObj?.chapters.find(ch => ch.id === chapterId);

        if (!chapterObj) {
            this.showError(`Chapter with ID ${chapterId} not found.`);
             this.navigateTo('unit', {classId: classId, unitId: unitId });
            return;
        }

        const title = document.createElement('h2');
        title.textContent = `Videos for ${chapterObj.name} (${unitObj.name} - ${classObj.name})`;
        this.dynamicContent.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid-container'; // Reuse grid-container for videos

        if (!chapterObj.videos || chapterObj.videos.length === 0) {
            this.renderEmptyState(`No videos found in ${chapterObj.name}.`);
            return;
        }

        chapterObj.videos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            grid.appendChild(videoCard);
        });
        this.dynamicContent.appendChild(grid);
    }
    
    createCard(title, icon, description, onClickAction) {
        const card = document.createElement('div');
        card.className = 'card focusable';
        card.tabIndex = 0;

        if (icon) {
            const iconEl = document.createElement('span');
            iconEl.className = 'card-icon';
            iconEl.textContent = icon; // Assuming emoji or simple text icon
            // If icon is a path:
            // const imgEl = document.createElement('img'); imgEl.src = icon; iconEl.appendChild(imgEl);
            card.appendChild(iconEl);
        }

        const titleEl = document.createElement('h3');
        titleEl.className = 'card-title';
        titleEl.textContent = title;
        card.appendChild(titleEl);

        if (description) {
            const descEl = document.createElement('p');
            descEl.className = 'card-description';
            descEl.textContent = description;
            card.appendChild(descEl);
        }

        card.addEventListener('click', onClickAction);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClickAction();
            }
        });
        return card;
    }

    createVideoCard(video) {
        const card = document.createElement('div');
        card.className = 'card video-card focusable'; // Add video-card class
        card.tabIndex = 0;
        card.dataset.videoId = video.id;

        card.innerHTML = `
            <div class="video-thumbnail-container">
                ${video.thumbnailPath ? `<img src="${video.thumbnailPath}" alt="${video.title} thumbnail" loading="lazy">` : '📹'}
                <div class="play-overlay">▶</div>
            </div>
            <div class="video-info">
                <h4 class="video-title">${video.title}</h4>
                ${video.duration ? `<p class="video-duration">Duration: ${video.duration}</p>` : ''}
            </div>
        `;
        
        card.addEventListener('click', () => this.playVideo(video));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.playVideo(video);
            }
        });
        return card;
    }

    playVideo(video) {
        this.currentVideo = video;
        this.currentVideoTitleModal.textContent = video.title;
        this.videoPlayer.src = video.videoPath; // Direct path, no decryption
        this.videoPlayerModal.style.display = 'block';
        this.videoPlayer.focus(); // Focus the player for controls
        this.videoPlayer.play().catch(e => console.warn("Autoplay prevented or error:", e));
    }

    closeVideoPlayer() {
        this.videoPlayerModal.style.display = 'none';
        this.videoPlayer.pause();
        this.videoPlayer.src = ''; // Release video resource
        this.currentVideo = null;
        // Optionally, return focus to the last active element or a relevant navigation element
    }

    restoreVideoPosition() {
        if (this.currentVideo) {
            const savedTime = localStorage.getItem(`r_ed_video_${this.currentVideo.id}_time`);
            if (savedTime && this.videoPlayer.duration > parseFloat(savedTime)) {
                this.videoPlayer.currentTime = parseFloat(savedTime);
            }
        }
    }

    saveVideoPosition() {
        if (this.currentVideo && this.videoPlayer.currentTime > 0 && this.videoPlayer.duration > 0) {
            // Only save if significant progress is made (e.g., > 5 seconds and not at the very end)
            if (this.videoPlayer.currentTime > 5 && (this.videoPlayer.duration - this.videoPlayer.currentTime > 5)) {
                 localStorage.setItem(`r_ed_video_${this.currentVideo.id}_time`, this.videoPlayer.currentTime.toString());
            } else if (this.videoPlayer.duration - this.videoPlayer.currentTime <= 5) {
                // If video is near end, clear saved position to restart next time
                localStorage.removeItem(`r_ed_video_${this.currentVideo.id}_time`);
            }
        }
    }
    
    renderStaticPage(title, contentHTML) {
        const titleEl = document.createElement('h1');
        titleEl.textContent = title;
        this.dynamicContent.appendChild(titleEl);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'static-page-content';
        contentWrapper.innerHTML = contentHTML;
        this.dynamicContent.appendChild(contentWrapper);
    }
    
    getLicenseContent() {
        return `
            <h2>Software License Agreement</h2>
            <p>This R-Edification Educational Platform ("Software") is provided for educational purposes only. Please read the following terms carefully.</p>
            <h3>1. Grant of License</h3>
            <p>R-Edification grants you a non-exclusive, non-transferable license to use this Software strictly for personal, non-commercial educational use.</p>
            <h3>2. Restrictions</h3>
            <p>You may not:
                <ul>
                    <li>Modify, adapt, translate, reverse engineer, decompile, or disassemble the Software.</li>
                    <li>Distribute, sublicense, rent, lease, or lend the Software or its content to any third party.</li>
                    <li>Use the Software for any commercial purpose.</li>
                    <li>Remove or alter any copyright notices or other proprietary notices on the Software.</li>
                </ul>
            </p>
            <h3>3. Content</h3>
            <p>All video content, images, and textual materials provided within this Software are the property of R-Edification or its content licensors and are protected by copyright laws. Unauthorized reproduction or distribution is strictly prohibited.</p>
            <h3>4. Disclaimer of Warranty</h3>
            <p>The Software is provided "AS IS" without any warranties of any kind, express or implied. R-Edification does not warrant that the Software will be error-free or uninterrupted.</p>
            <h3>5. Limitation of Liability</h3>
            <p>In no event shall R-Edification be liable for any damages (including, without limitation, lost profits, business interruption, or lost information) rising out of 'Authorized Users' use of or inability to use the Software.</p>
            <p>By using this Software, you acknowledge that you have read this agreement, understand it, and agree to be bound by its terms and conditions.</p>
        `;
    }

    getAboutContent() {
        return `
            <h2>About R-Edification</h2>
            <p>R-Edification is committed to revolutionizing education by providing high-quality, accessible, and engaging learning resources. Our mission is to empower students with the knowledge and skills they need to succeed in their academic journey and beyond.</p>
            <h3>Our Vision</h3>
            <p>To be a leading provider of innovative educational solutions that foster a love for learning and help students achieve their full potential.</p>
            <h3>Our Content</h3>
            <p>This platform offers a curated library of educational videos designed for students from Class 5 to Class 8 (and beyond, as content grows). Our materials are developed by experienced educators and subject matter experts, aligning with modern pedagogical approaches.</p>
            <h3>Contact Us</h3>
            <p>While this is a standalone application, for any inquiries regarding R-Edification and its broader services, please visit our (hypothetical) website: www.r-edification.com or contact us at info@r-edification.com.</p>
            <p><em>Thank you for choosing R-Edification!</em></p>
        `;
    }

    getHelpContent() {
        return `
            <h2>Help & Instructions</h2>
            <p>Welcome to the R-Edification Educational Platform! Here’s how to get started:</p>
            <h3>Navigation</h3>
            <ul>
                <li><strong>Main Menu:</strong> Use the buttons at the top (Home, License, About, Help) to navigate between different sections of the application.</li>
                <li><strong>Content Browsing:</strong>
                    <ul>
                        <li>Start from the 'Home' page to see available Classes.</li>
                        <li>Click on a Class card to view its Units.</li>
                        <li>Click on a Unit card to view its Chapters.</li>
                        <li>Click on a Chapter card to see the list of Videos.</li>
                    </ul>
                </li>
                <li><strong>Breadcrumbs:</strong> The path displayed below the main menu (e.g., Home > Class 5 > Mathematics) helps you see where you are. Click on any part of the breadcrumb trail to navigate back to that level.</li>
            </ul>
            <h3>Video Playback</h3>
            <ul>
                <li><strong>Playing a Video:</strong> Click on any video card to open the video player.</li>
                <li><strong>Video Controls:</strong> Use the standard video player controls (play/pause, volume, seek bar, fullscreen) to manage playback.</li>
                <li><strong>Closing the Player:</strong> Click the '×' button at the top-right of the player, or press the 'ESC' key on your keyboard.</li>
                <li><strong>Resume Playback:</strong> The player will attempt to remember your last position in a video if you close and reopen it later.</li>
            </ul>
            <h3>Keyboard Navigation (for TV Remotes & Accessibility)</h3>
            <ul>
                <li><strong>Tabbing:</strong> Use the 'Tab' key on your keyboard (or directional arrows on a TV remote) to move focus between clickable items (navigation buttons, cards, video player controls). Focused items will have a blue outline.</li>
                <li><strong>Selection:</strong> Press 'Enter' or 'Spacebar' to activate a focused item (e.g., open a class, play a video).</li>
                <li><strong>Player Escape:</strong> Press 'ESC' to close the video player.</li>
            </ul>
            <h3>Troubleshooting</h3>
            <ul>
                <li><strong>Video Not Playing:</strong> Ensure the video files are correctly placed in the '/content/' folder structure as expected by the application. Check file paths in the <code>R_EDIFICATION_CONTENT</code> data within <code>app.js</code> if you are customizing content.</li>
                <li><strong>Content Not Loading:</strong> Verify that the <code>R_EDIFICATION_CONTENT</code> data in <code>app.js</code> is correctly formatted and that all specified paths are accurate.</li>
            </ul>
            <p>We hope you enjoy your learning experience with R-Edification!</p>
        `;
    }

    renderEmptyState(message) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state-container';
        emptyDiv.innerHTML = `
            <h3>${message || 'No Content Available'}</h3>
            <p>Please check your content configuration or try a different selection.</p>
        `;
        this.dynamicContent.appendChild(emptyDiv);
    }

    showError(message) {
        this.errorDisplay.innerHTML = `<div class="error-message"><strong>Error:</strong> ${message}</div>`;
        console.error("R-Edification App Error:", message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new REdificationApp();
});