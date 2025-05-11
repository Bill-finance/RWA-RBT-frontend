import { Tooltip } from "antd";
import { useAccount } from "wagmi";

export interface HashTextProps {
  text: string;
}

export default function HashText({ text }: HashTextProps) {
  const { address } = useAccount();
  const isCurrentUser = address?.toLowerCase() === text?.toLowerCase();

  return text.length < 10 ? (
    <div className="text-zinc-400">
      {text} {isCurrentUser ? "(You)" : ""}
    </div>
  ) : (
    <Tooltip title={`${text} ${isCurrentUser ? "(You)" : ""}`}>
      <div className="text-zinc-400">
        {text.slice(0, 6)}...{text.slice(-4)}
      </div>
    </Tooltip>
  );
}
