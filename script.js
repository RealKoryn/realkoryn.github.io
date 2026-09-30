const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
if(menuBtn&&mobileMenu){
  menuBtn.addEventListener('click',()=>{
    const open=mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',open);
  });
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));
}

document.getElementById('year').textContent=new Date().getFullYear();

const REVIEW_SPEED_CONFIG={normal:0.12,hover:0.04,smoothing:220};

const reviewsGrid=document.getElementById('reviewsGrid');
if(reviewsGrid&&Array.isArray(reviews)){
  const renderReviews=items=>items.map(review=>{
    const rating=Math.max(0,Math.min(5,Number(review.rating)||0));
    const stars='★'.repeat(rating)+'☆'.repeat(5-rating);
    return `<article class="review-card"><div class="review-top"><div class="review-person"><img class="review-pfp" src="${review.pfp}" alt="${review.name}" loading="lazy"><div class="review-name"><strong>${review.name}</strong><span>${review.username||''}</span></div></div><div class="review-rating" aria-label="${rating} out of 5 stars">${stars}</div></div><p class="review-text">${review.text}</p>${review.date?`<span class="review-date">${review.date}</span>`:''}</article>`;
  }).join('');
  const content=renderReviews(reviews);
  reviewsGrid.innerHTML=`<div class="reviews-track"><div class="reviews-set">${content}</div><div class="reviews-set" aria-hidden="true">${content}</div></div>`;
  const reviewsTrack=reviewsGrid.querySelector('.reviews-track');
  const reviewsSet=reviewsGrid.querySelector('.reviews-set');
  let reviewX=0;
  let reviewTargetSpeed=REVIEW_SPEED_CONFIG.normal;
  let reviewSpeed=REVIEW_SPEED_CONFIG.normal;
  let lastReviewFrame=performance.now();
  const updateReviews=now=>{
    const delta=Math.min(40,now-lastReviewFrame);
    lastReviewFrame=now;
    reviewSpeed+=(reviewTargetSpeed-reviewSpeed)*Math.min(1,delta/REVIEW_SPEED_CONFIG.smoothing);
    const setWidth=reviewsSet.getBoundingClientRect().width;
    if(setWidth>0){
      reviewX-=reviewSpeed*delta;
      if(reviewX<=-setWidth) reviewX+=setWidth;
      reviewsTrack.style.transform=`translate3d(${reviewX}px,0,0)`;
    }
    requestAnimationFrame(updateReviews);
  };
  reviewsGrid.addEventListener('mouseenter',()=>{reviewTargetSpeed=REVIEW_SPEED_CONFIG.hover});
  reviewsGrid.addEventListener('mouseleave',()=>{reviewTargetSpeed=REVIEW_SPEED_CONFIG.normal});
  requestAnimationFrame(updateReviews);
}

const changingText=document.getElementById('changingText');
const words=['High-Performance','Game-Ready','Polished','Scalable','Player-Focused'];
let wordIndex=0;
setInterval(()=>{
  changingText.classList.add('swap');
  setTimeout(()=>{
    wordIndex=(wordIndex+1)%words.length;
    changingText.textContent=words[wordIndex];
    changingText.classList.remove('swap');
  },250);
},3000);

const modal=document.getElementById('videoModal');
const video=document.getElementById('showcaseVideo');
const title=document.getElementById('videoTitle');
const videoTimes={};
let activeVideoKey='';

const thumbnailVideos=document.querySelectorAll('.thumbnail video');
thumbnailVideos.forEach(thumb=>{
  thumb.addEventListener('loadedmetadata',()=>{
    const saved=videoTimes[thumb.src];
    if(saved!=null&&Number.isFinite(saved)){
      thumb.currentTime=Math.min(saved,thumb.duration||saved);
    }
  });
  thumb.addEventListener('click',event=>event.preventDefault());
});

const close=()=>{
  if(activeVideoKey){
    videoTimes[activeVideoKey]=video.currentTime||0;
    document.querySelectorAll('.thumbnail video').forEach(thumb=>{
      if(thumb.src===activeVideoKey&&thumb.readyState>=1){
        try{thumb.currentTime=videoTimes[activeVideoKey];}catch{}
      }
    });
  }
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  video.pause();
  video.removeAttribute('src');
  video.load();
};

document.querySelectorAll('.showcase-card').forEach(card=>card.addEventListener('click',()=>{
  activeVideoKey=new URL(card.dataset.video,window.location.href).href;
  video.src=card.dataset.video;
  title.textContent=card.dataset.title;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  video.addEventListener('loadedmetadata',()=>{
    const saved=videoTimes[activeVideoKey];
    if(saved!=null) video.currentTime=Math.min(saved,video.duration||saved);
    video.play().catch(()=>{});
  },{once:true});
}));

video.addEventListener('timeupdate',()=>{
  if(activeVideoKey) videoTimes[activeVideoKey]=video.currentTime;
});

document.getElementById('modalClose').addEventListener('click',close);
modal.querySelector('[data-close]').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
