import { Tooltip } from "antd";
import { useAccount } from "wagmi";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { message } from "../Message";

export interface HashTextProps {
  text: string;
}

export default function HashText({ text }: HashTextProps) {
  const { address } = useAccount();
  const isCurrentUser = address?.toLowerCase() === text?.toLowerCase();

  const handleCopy = () => {
    message.success("Address copied to clipboard");
  };

  // isCurrentUser
  //   ? `${text} <span className="text-white font-bold"> (You)</span>`
  //   : `${text}`
  return text.length < 10 ? (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <div className="text-zinc-400 cursor-pointer hover:text-zinc-300">
        {text} <span className="text-white font-bold">(You)</span>
      </div>
    </CopyToClipboard>
  ) : (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <Tooltip
        title={
          <div>
            {text}
            {isCurrentUser && (
              <span className="text-white font-bold"> (You)</span>
            )}
          </div>
        }
      >
        <div
          className={`${
            isCurrentUser ? "text-white font-bold" : "text-zinc-400"
          } cursor-pointer hover:text-zinc-300`}
        >
          {text.slice(0, 6)}...{text.slice(-4)}
        </div>
      </Tooltip>
    </CopyToClipboard>
  );
}
