export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand-mark">OV</div>
        <div>
          <h1 className="app-title">Overflow Visual Demo</h1>
          <p className="app-subtitle">
            Split-view educational interface for operator-side actions and mock
            target behavior
          </p>
        </div>
      </div>

      <div className="topbar-right">
        <span className="pill pill-purple">Visual Only</span>
        <span className="pill pill-blue">No Logic Yet</span>
        <span className="pill pill-green">Local Demo</span>
      </div>
    </header>
  );
}