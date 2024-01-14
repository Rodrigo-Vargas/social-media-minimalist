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

function process() {
   hideYTShorts();
   const allowedChannels = listSubscribedChannels();

   const videos = document.querySelectorAll("ytd-rich-item-renderer");

   videos.forEach(video => {
      const ads = video.querySelector("ytd-ad-slot-renderer");
      if (ads)
      {
         if (video.style.display != 'none')
            video.style.display = 'none';
         return;
      }

      const gridSlimMedia = video.querySelector("ytd-rich-grid-slim-media");

      if (gridSlimMedia && gridSlimMedia.hasAttribute("is-short"))
      {
         if (video.style.display != 'none')
            video.style.display = 'none';
         return;
      }

      const title = video.querySelector("yt-formatted-string#video-title");

      if (!title)
      {
         console.log(video);
         return;
      }

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

function listSubscribedChannels() {
   const allowedChannels = [];
   const sections = document.querySelectorAll("ytd-guide-section-renderer");

   sections.forEach(section => {
      const sectionTitle = section.querySelector("&>h3 yt-formatted-string");
      
      if (sectionTitle.textContent == 'Subscriptions')
      {
         const subscriptions = section.querySelectorAll("ytd-guide-entry-renderer");

         subscriptions.forEach(subscription => {
            const title = subscription.querySelector("yt-formatted-string");
            allowedChannels.push(title.textContent);
         });
      }
   });

   return allowedChannels;
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
   console.log('process')
   process();
});

observer.observe(document, {
   subtree: true,
   childList: true
   //attributes: true
});
