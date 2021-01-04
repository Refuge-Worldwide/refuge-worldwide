export const Close = ({ size = 36, strokeWidth = 2, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 36 36"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4l28 28m0-28L4 32"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const Menu = ({ size = 36, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 36 36"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 5h36v2H0V5zm0 12h36v2H0v-2zm36 12H0v2h36v-2z"
      fill="currentColor"
    />
  </svg>
);
