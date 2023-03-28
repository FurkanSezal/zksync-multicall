import { ConnectButton } from "@web3uikit/web3";

export default function Header() {
  return (
    <nav>
      <div className="py-4 px-4">
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>
  );
}
