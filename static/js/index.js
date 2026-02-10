window.HELP_IMPROVE_VIDEOJS = false;

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function restructureDemoLayout() {
    if (document.body.dataset.demoRestructured === '1') {
        return;
    }

    const emergentSection = document.getElementById('emergent');
    const preSection = document.getElementById('pre-training');
    const postSection = document.getElementById('post-training');
    if (!emergentSection || !preSection || !postSection) {
        return;
    }

    const preContainer = preSection.querySelector('.container');
    const postContainer = postSection.querySelector('.container');
    const preGeneration = document.getElementById('pretrain-generation');
    const postGeneration = document.getElementById('posttrain-generation');
    const preUnderstanding = document.getElementById('pretrain-understanding');
    const postUnderstanding = document.getElementById('posttrain-understanding');
    const emergentNote = emergentSection.querySelector('.demo-note');
    const emergentGrid = emergentSection.querySelector('.card-grid');
    if (!preContainer || !postContainer || !preGeneration || !postGeneration || !preUnderstanding || !postUnderstanding || !emergentGrid) {
        return;
    }

    const generationTitle = preContainer.querySelector('h2.title.is-3');
    const generationSubtitle = preContainer.querySelector('p.subtitle.is-6');
    if (generationTitle) {
        generationTitle.textContent = 'Generation';
    }
    if (generationSubtitle) {
        generationSubtitle.textContent = 'Audio generation demos organized by training stage.';
    }

    const understandingTitle = postContainer.querySelector('h2.title.is-3');
    const understandingSubtitle = postContainer.querySelector('p.subtitle.is-6');
    if (understandingTitle) {
        understandingTitle.textContent = 'Understanding';
    }
    if (understandingSubtitle) {
        understandingSubtitle.textContent = 'Audio understanding demos organized by training stage.';
    }

    const setSubsectionTitle = function(section, titleText) {
        const title = section.querySelector('h3.title.is-4');
        if (title) {
            title.textContent = titleText;
        }
    };
    setSubsectionTitle(preGeneration, 'Pre-training');
    setSubsectionTitle(postGeneration, 'Post-training');
    setSubsectionTitle(preUnderstanding, 'Pre-training');
    setSubsectionTitle(postUnderstanding, 'Post-training');

    const preUnderstandingSubtitle = preUnderstanding.querySelector('p.subtitle.is-6');
    if (preUnderstandingSubtitle) {
        preUnderstandingSubtitle.textContent = 'Understanding results from pre-training checkpoints.';
    }
    const postUnderstandingSubtitle = postUnderstanding.querySelector('p.subtitle.is-6');
    if (postUnderstandingSubtitle) {
        postUnderstandingSubtitle.textContent = 'Understanding results from instruction-tuned checkpoints.';
    }

    const extraObservation = document.createElement('div');
    extraObservation.className = 'demo-subsection';
    extraObservation.id = 'extra-observation';

    const extraTitle = document.createElement('h3');
    extraTitle.className = 'title is-4';
    extraTitle.textContent = 'Extra Observation';

    const extraSubtitle = document.createElement('p');
    extraSubtitle.className = 'subtitle is-6';
    extraSubtitle.textContent = 'Additional generation observations from instruction-tuned samples.';

    extraObservation.appendChild(extraTitle);
    extraObservation.appendChild(extraSubtitle);
    if (emergentNote) {
        extraObservation.appendChild(emergentNote);
    }
    extraObservation.appendChild(emergentGrid);

    preContainer.appendChild(postGeneration);
    preContainer.appendChild(extraObservation);

    const understandingToggle = document.createElement('details');
    understandingToggle.className = 'demo-toggle';

    const toggleSummary = document.createElement('summary');
    toggleSummary.textContent = 'Click to expand understanding demos';
    understandingToggle.appendChild(toggleSummary);

    const toggleBody = document.createElement('div');
    toggleBody.className = 'demo-toggle-body';
    toggleBody.appendChild(preUnderstanding);
    toggleBody.appendChild(postUnderstanding);
    understandingToggle.appendChild(toggleBody);

    postContainer.appendChild(understandingToggle);
    emergentSection.remove();

    document.body.dataset.demoRestructured = '1';
}

function alignPosttrainInputs() {
    const grids = document.querySelectorAll('#posttrain-understanding .card-grid, #posttrain-generation .card-grid, #extra-observation .card-grid');
    grids.forEach(grid => {
        const inputs = grid.querySelectorAll('.sample-card--posttrain .demo-card-input');
        if (!inputs.length) {
            return;
        }
        let maxHeight = 0;
        inputs.forEach(input => {
            input.style.height = 'auto';
            const height = input.offsetHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
        });
        inputs.forEach(input => {
            input.style.height = `${maxHeight}px`;
        });
    });
}

function stripPretrainUnderstandingExtras() {
    const section = document.getElementById('pretrain-understanding');
    if (!section) {
        return;
    }
    section.querySelectorAll('.fold--thinking').forEach(el => el.remove());
    section.querySelectorAll('.field').forEach(field => {
        const label = field.querySelector('.field-label');
        if (!label) {
            return;
        }
        if (label.textContent.trim().toLowerCase() === 'answer') {
            field.remove();
        }
    });
    section.querySelectorAll('details').forEach(details => {
        const summary = details.querySelector('summary');
        if (!summary) {
            return;
        }
        const summaryText = summary.textContent.trim().toLowerCase();
        if (summaryText === 'thinking' || summaryText === 'answer') {
            details.remove();
        }
    });
}

function setupDemoAudioInteractions() {
    const cards = document.querySelectorAll('.sample-card');
    cards.forEach(card => {
        const header = card.querySelector('.sample-header');
        const hasAudio = card.querySelector('audio');
        if (!header || !hasAudio || header.querySelector('.sample-cta')) {
            return;
        }

        const cta = document.createElement('span');
        cta.className = 'sample-cta';
        cta.textContent = 'Tap to listen';
        header.appendChild(cta);
    });

    const audios = document.querySelectorAll('.sample-card audio');
    audios.forEach(audio => {
        if (audio.dataset.demoBound === '1') {
            return;
        }
        audio.dataset.demoBound = '1';

        const card = audio.closest('.sample-card');
        if (!card) {
            return;
        }

        audio.addEventListener('play', function() {
            audios.forEach(other => {
                if (other !== audio && !other.paused) {
                    other.pause();
                }
            });
            document.querySelectorAll('.sample-card.is-playing').forEach(el => {
                if (el !== card) {
                    el.classList.remove('is-playing');
                }
            });
            card.classList.add('is-playing');
        });

        const clearPlayingState = function() {
            card.classList.remove('is-playing');
        };
        audio.addEventListener('pause', clearPlayingState);
        audio.addEventListener('ended', clearPlayingState);
    });
}

let resizeTimer;
window.addEventListener('resize', function() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(alignPosttrainInputs, 150);
});

window.addEventListener('load', function() {
    restructureDemoLayout();
    stripPretrainUnderstandingExtras();
    setupDemoAudioInteractions();
    alignPosttrainInputs();
});

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    restructureDemoLayout();
    stripPretrainUnderstandingExtras();
    setupDemoAudioInteractions();
    alignPosttrainInputs();

})
