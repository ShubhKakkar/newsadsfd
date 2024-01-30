import {
  FacebookShareButton,
  TwitterShareButton,
  InstagramShareButton,
} from "react-share";

const Share = ({ data, shareHandler }) => {
  return (
    <>
      <FacebookShareButton
        url={data.shareUrl}
        quote={data.name}
        hashtag={`${data.hashTag ? data.hashTag : "#product"} `}
        className="custom_facebook"
        onShareWindowClose={() => shareHandler && shareHandler()}
      >
                
        <svg
          width={25}
          height={25}
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12.5" cy="12.5" r="12.5" fill="#151875" />
          <path
            d="M13.9305 17.9984V12.5344H15.7739L16.0479 10.395H13.9305V9.03236C13.9305 8.41502 14.1025 7.99236 14.9885 7.99236H16.1112V6.08502C15.565 6.02648 15.0159 5.99822 14.4665 6.00036C12.8372 6.00036 11.7185 6.99502 11.7185 8.82102V10.391H9.88721V12.5304H11.7225V17.9984H13.9305Z"
            fill="white"
          />
        </svg>
              
      </FacebookShareButton>
      <TwitterShareButton
        url={data.shareUrl}
        quote={data?.name}
        hashtag={`${data.hashTag ? data.hashTag : "#product"} `}
        className="custom_twitter"
        onShareWindowClose={() => shareHandler && shareHandler()}
      >
          
        {/* <a href="#!"> */}
        <svg
          width={26}
          height={25}
          viewBox="0 0 26 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12.8545" cy="12.5" r="12.5" fill="#151875" />
          <g clipPath="url(#clip0_219_3614)">
            <path
              d="M20.1163 7.29147C19.5597 7.53813 18.9617 7.7048 18.333 7.78013C18.9817 7.39199 19.467 6.78111 19.6983 6.06147C19.0889 6.42346 18.4219 6.67826 17.7263 6.8148C17.2586 6.31538 16.639 5.98435 15.9639 5.87312C15.2887 5.76188 14.5957 5.87666 13.9925 6.19963C13.3893 6.52261 12.9095 7.03571 12.6278 7.65927C12.346 8.28283 12.278 8.98197 12.4343 9.64813C11.1995 9.58613 9.99142 9.26517 8.88862 8.70607C7.78582 8.14697 6.8129 7.36224 6.033 6.4028C5.76634 6.8628 5.613 7.39613 5.613 7.96413C5.61271 8.47546 5.73863 8.97896 5.97959 9.42995C6.22055 9.88095 6.56911 10.2655 6.99434 10.5495C6.50119 10.5338 6.01892 10.4005 5.58767 10.1608V10.2008C5.58762 10.918 5.83569 11.6131 6.28979 12.1681C6.74389 12.7232 7.37605 13.1041 8.079 13.2461C7.62153 13.3699 7.1419 13.3882 6.67634 13.2995C6.87467 13.9165 7.261 14.4562 7.78125 14.8428C8.3015 15.2294 8.92962 15.4436 9.57767 15.4555C8.47756 16.3191 7.11893 16.7875 5.72034 16.7855C5.47259 16.7855 5.22505 16.7711 4.979 16.7421C6.39865 17.6549 8.05123 18.1393 9.739 18.1375C15.4523 18.1375 18.5757 13.4055 18.5757 9.30147C18.5757 9.16813 18.5723 9.03347 18.5663 8.90013C19.1739 8.46078 19.6983 7.91673 20.115 7.29347L20.1163 7.29147Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_219_3614">
              <rect
                width={16}
                height={16}
                fill="white"
                transform="translate(4.354 4.00024)"
              />
            </clipPath>
          </defs>
        </svg>
        {/* </a> */}
      </TwitterShareButton>
    </>
  );
};

export default Share;
