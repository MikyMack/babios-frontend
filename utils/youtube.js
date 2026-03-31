// utils/youtube.js
exports.getEmbedUrl = (url) => {
    if (!url) return '';

    // If it's already an embed URL, return as is
    if (url.includes('/embed/')) {
        return url;
    }

    let videoId = '';

    if (url.includes('watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('/embed/')) {
        // Extract videoId from embed URL
        const match = url.match(/\/embed\/([^?]+)/);
        videoId = match ? match[1] : '';
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    return url; // Return original if can't parse
};