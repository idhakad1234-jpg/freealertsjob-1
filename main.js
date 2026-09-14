const apiKey = 'AIzaSyA1VwqNRY99IxnE-jvns5XH_xg_AYRkstQ';
const blogId = '1576315044142208495';
const maxResults = 5;

async function fetchPosts(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=${maxResults}&labels=${label}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            container.innerHTML = ''; // Clear existing static content
            data.items.forEach(post => {
                const postElement = document.createElement('a');
                postElement.href = `post-detail.html?postId=${post.id}`;
                postElement.textContent = post.title;

                if (containerId === 'latest-jobs-container') {
                    const jobItem = document.createElement('div');
                    jobItem.classList.add('job-item');

                    const titleLink = document.createElement('a');
                    titleLink.href = `post-detail.html?postId=${post.id}`;
                    titleLink.textContent = post.title;

                    const lastApplyDate = document.createElement('p');
                    lastApplyDate.innerHTML = `<i class="fa-regular fa-calendar-days"></i> Last Apply Date: ${getMetaValue(post.content, 'Last Apply Date')}`

                    jobItem.appendChild(titleLink);
                    jobItem.appendChild(lastApplyDate);
                    container.appendChild(jobItem);
                } else {
                    container.appendChild(postElement);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function fetchAndDisplayFullPostList(label, containerId, viewMoreId) {
    const container = document.getElementById(containerId);
    const viewMoreButton = document.getElementById(viewMoreId);
    if (!container) return;

    let nextPageToken = '';

    async function loadMore() {
        let url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=${maxResults}&labels=${label}&key=${apiKey}`;
        if (nextPageToken) {
            url += `&pageToken=${nextPageToken}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.items) {
                data.items.forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.classList.add('post-card');

                    const titleLink = document.createElement('a');
                    titleLink.href = `post-detail.html?postId=${post.id}`;
                    titleLink.classList.add('post-title');
                    titleLink.textContent = post.title;

                    const meta = document.createElement('p');
                    meta.classList.add('post-meta');
                    
                    let metaContent = '';
                    if(post.content) {
                        const lastApplyDate = getMetaValue(post.content, 'Last Apply Date');
                        if (lastApplyDate !== 'N/A') {
                            metaContent = `<i class="fa-regular fa-calendar-days"></i> Last Apply Date: ${lastApplyDate}`;
                        } else {
                             metaContent = `<i class="fa-regular fa-calendar-days"></i> Published on: ${new Date(post.published).toLocaleDateString()}`;
                        }
                    } else {
                        metaContent = `<i class="fa-regular fa-calendar-days"></i> Published on: ${new Date(post.published).toLocaleDateString()}`;
                    }
                    meta.innerHTML = metaContent;

                    postCard.appendChild(titleLink);
                    postCard.appendChild(meta);
                    container.appendChild(postCard);
                });

                if (data.nextPageToken) {
                    nextPageToken = data.nextPageToken;
                    if(viewMoreButton) viewMoreButton.style.display = 'block';
                } else {
                    if(viewMoreButton) viewMoreButton.style.display = 'none';
                }
            } else {
                if(viewMoreButton) viewMoreButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    container.innerHTML = '';
    await loadMore();

    if (viewMoreButton) {
        viewMoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            loadMore();
        });
    }
}

async function fetchLatestPost(label, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?maxResults=1&labels=${label}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            element.textContent = data.items[0].title;
        }
    } catch (error) {
        console.error(`Error fetching latest post for ${label}:`, error);
    }
}


async function fetchPostDetails() {
    const postDetailContainer = document.querySelector('.post-detail-container');
    if (!postDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');

    if (postId) {
        try {
            const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}?key=${apiKey}`;
            const response = await fetch(url);
            const post = await response.json();

            document.title = `${post.title} - Govt Jobs India Now`;

            postDetailContainer.innerHTML = post.content;

        } catch (error) {
            console.error('Error fetching post details:', error);
        }
    }
}

function getMetaValue(content, metaName) {
    if (!content) return 'N/A';
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const metaTag = doc.querySelector(`meta[property='${metaName}']`);
    return metaTag ? metaTag.getAttribute('content') : 'N/A';
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Pop-up Modal Logic
    const popupContainer = document.getElementById('popup-container');
    const popupCloseButton = document.getElementById('popup-close-button');

    if (popupContainer && popupCloseButton) {
        // Check if the pop-up has been shown before
        if (localStorage.getItem('popupShown') !== 'true') {
            popupContainer.style.display = 'flex';
        }

        // Close the pop-up and set the flag in localStorage
        popupCloseButton.addEventListener('click', () => {
            popupContainer.style.display = 'none';
            localStorage.setItem('popupShown', 'true');
        });

        // Optional: Close the pop-up if the user clicks outside the modal
        popupContainer.addEventListener('click', (event) => {
            if (event.target === popupContainer) {
                popupContainer.style.display = 'none';
                localStorage.setItem('popupShown', 'true');
            }
        });
    }

    if (document.querySelector('.job-sections')) {
        fetchPosts('Results', 'results-container');
        fetchPosts('Admit Card', 'admit-card-container');
        fetchPosts('Latest Jobs', 'latest-jobs-container');
        fetchPosts('Answer Key', 'answer-key-container');
        fetchPosts('Syllabus', 'syllabus-container');
        fetchPosts('Exam Date', 'exam-date-container');
    }

    if (document.querySelector('.latest-updates')) {
        fetchLatestPost('Results', 'latest-result');
        fetchLatestPost('Admit Card', 'latest-admit-card');
        fetchLatestPost('Latest Jobs', 'latest-latest-job');
        fetchLatestPost('Answer Key', 'latest-answer-key');
        fetchLatestPost('Syllabus', 'latest-syllabus');
        fetchLatestPost('Exam Date', 'latest-exam-date');
    }

    const postListContainer = 'post-list-container';
    const viewMoreButton = 'view-more-button';
    const path = window.location.pathname;

    if (path.includes('latest-jobs.html')) {
        fetchAndDisplayFullPostList('Latest Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('result.html')) {
        fetchAndDisplayFullPostList('Results', postListContainer, viewMoreButton);
    } else if (path.includes('admit-card.html')) {
        fetchAndDisplayFullPostList('Admit Card', postListContainer, viewMoreButton);
    } else if (path.includes('answer-key.html')) {
        fetchAndDisplayFullPostList('Answer Key', postListContainer, viewMoreButton);
    } else if (path.includes('syllabus.html')) {
        fetchAndDisplayFullPostList('Syllabus', postListContainer, viewMoreButton);
    } else if (path.includes('exam-date.html')) {
        fetchAndDisplayFullPostList('Exam Date', postListContainer, viewMoreButton);
    } else if (path.includes('railway-jobs.html')) {
        fetchAndDisplayFullPostList('Railway Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('computer-jobs.html')) {
        fetchAndDisplayFullPostList('Computer Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('bank-jobs.html')) {
        fetchAndDisplayFullPostList('Bank Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('police-jobs.html')) {
        fetchAndDisplayFullPostList('Police Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('defense-jobs.html')) {
        fetchAndDisplayFullPostList('Defense Jobs', postListContainer, viewMoreButton);
    } else if (path.includes('online-form.html')) {
        fetchAndDisplayFullPostList('Online Form', postListContainer, viewMoreButton);
    } else if (path.includes('online-tools.html')) {
        fetchAndDisplayFullPostList('Online Tools', postListContainer, viewMoreButton);
    }


    if (window.location.pathname.includes('post-detail.html')) {
        fetchPostDetails();
    }
});