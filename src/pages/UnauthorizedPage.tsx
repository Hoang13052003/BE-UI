function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-gray-700 text-center max-w-md mb-6">
        You do not have permission to access this page. Please check your
        permissions or contact the administrator.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onMouseOver={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#0056b3";
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#007bff";
        }}
      >
        Go Back
      </button>
    </div>
  );
}

export default UnauthorizedPage;
