export const shareHymn = async (hymn) => {
  const shareData = {
    title: hymn.title,
    text: `${hymn.title} by ${hymn.author}`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true };
    } catch (err) {
      console.error('Error sharing:', err);
      return { success: false, error: err };
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      return { success: true, fallback: true };
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      return { success: false, error: err };
    }
  }
};