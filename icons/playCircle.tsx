export default function PlayCircle({ title = "Play", titleId = "play-large" }) {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{title}</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M60 0A60 60 0 1060 120 60 60 0 0060 0zM37.733 6.239a58.19 58.19 0 1144.535 107.52A58.19 58.19 0 0137.732 6.24zm1.308 27.249l52.262 26.131L39.04 85.752V33.488z"
        fill="currentColor"
      />
    </svg>
  );
}
