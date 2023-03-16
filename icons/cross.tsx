export const Cross = ({
  size = 20,
  className = "",
  colour = "black",
  strokeWidth = "1.5",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 30 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <line
      y1="-0.75"
      x2="41.2536"
      y2="-0.75"
      transform="matrix(0.699721 0.714416 -0.699721 0.714416 0 2.52783)"
      stroke={colour}
      strokeWidth={strokeWidth}
    />
    <line
      y1="-0.75"
      x2="41.2536"
      y2="-0.75"
      transform="matrix(0.699721 -0.714416 0.699721 0.714416 1.13403 31.4722)"
      stroke={colour}
      strokeWidth={strokeWidth}
    />
  </svg>
);
