import './Sidebar.css'

function Sidebar({ position, title, children }) {
  return (
    <div className={`sidebar sidebar-${position}`}>
      <h3>{title}</h3>
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  )
}

export default Sidebar
