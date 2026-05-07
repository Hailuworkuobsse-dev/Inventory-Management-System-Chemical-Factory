const DashboardGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {children}
    </div>
  );
};

export default DashboardGrid;
