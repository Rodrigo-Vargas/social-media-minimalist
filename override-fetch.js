const originalFetch = window.fetch;
const subscriptedChannels = [];
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const cloned = response.clone();
  const body = await cloned.text();

  if (response.url == "https://www.youtube.com/youtubei/v1/guide?prettyPrint=false") {
    const response = JSON.parse(body);
    const subscriptions = response.items[1].guideSubscriptionsSectionRenderer.items;

    subscriptions.forEach(subscription => {
      if (subscription.guideEntryRenderer)
        subscriptedChannels.push(subscription.guideEntryRenderer.formattedTitle.simpleText);

      if (subscription.guideCollapsibleEntryRenderer)
      {
        subscription.guideCollapsibleEntryRenderer.expandableItems.forEach(entry => {
          subscriptedChannels.push(entry.guideEntryRenderer.formattedTitle.simpleText)
        }); 
      }
    });
  }

  return response;
};

var observeDOM = (function () {
   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

   return function (obj, callback) {
      if (!obj || obj.nodeType !== 1) return;

      if (MutationObserver) {
         // define a new observer
         var mutationObserver = new MutationObserver(callback)

         // have the observer observe for changes in children
         mutationObserver.observe(obj, { childList: true, subtree: true })
         return mutationObserver
      }

      // browser support fallback
      else if (window.addEventListener) {
         obj.addEventListener('DOMNodeInserted', callback, false)
         obj.addEventListener('DOMNodeRemoved', callback, false)
      }
   }
})();

hideAdvertisementVideo = (video) => {
      const ads = video.querySelector("ytd-ad-slot-renderer");
      if (!ads)
         return false;

      if (video.style.display != 'none')
         video.style.display = 'none';

      return true;
}

hideShortsVideo = (video) => {
   const gridSlimMedia = video.querySelector("ytd-rich-grid-slim-media");

   if (gridSlimMedia && gridSlimMedia.hasAttribute("is-short"))
   {
      if (video.style.display != 'none')
         video.style.display = 'none';
      return true;
   }

   return false;
}

hideMixVideos = (video) => {
   const mix = video.querySelector(".yt-lockup-view-model-wiz");

   if (mix)
   {
      if (video.style.display != 'none')
         video.style.display = 'none';
      return true;
   }

   return false;
}

function process() {
   hideYTShorts();
   const allowedChannels = subscriptedChannels;

   const videos = document.querySelectorAll("ytd-rich-item-renderer");

   videos.forEach(video => {
      if (hideAdvertisementVideo(video))
         return;

      if (hideShortsVideo(video))
         return;

      if (hideMixVideos(video))
         return;

      const title = video.querySelector("yt-formatted-string#video-title");

      if (!title)
         return;

      const channelNameElement = video.querySelector("yt-formatted-string.ytd-channel-name a");

      const channelName = channelNameElement ? channelNameElement.textContent : "";

      if (allowedChannels.indexOf(channelName) < 0)
      {
         if (video.style.display != 'none')
            video.style.display = 'none';

         return;
      }
   });
}

function hideYTShorts() {
   const sections = document.querySelectorAll("ytd-rich-section-renderer");

   sections.forEach(section => {
      const renderer = section.querySelector("ytd-rich-shelf-renderer");

      const isShorts = renderer.hasAttribute("is-shorts");
      if (isShorts && section.style.display != 'none');
         section.style.display = 'none';
   });
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
   process();
});

observer.observe(document, {
   subtree: true,
   childList: true
});
