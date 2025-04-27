// import React from 'react';

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Truy cập bị từ chối</h1>
      <p className="text-gray-700 text-center max-w-md mb-6">
        Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra lại quyền hạn của bạn hoặc liên hệ với quản trị viên.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onMouseOver={(e) => {
          const target = e.target as HTMLElement; // Ép kiểu (type assertion) sang HTMLElement
          target.style.backgroundColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          const target = e.target as HTMLElement; // Ép kiểu (type assertion) sang HTMLElement
          target.style.backgroundColor = '#007bff';
        }}
      >
        Quay lại trang trước
      </button>
    </div>
  );
}

export default UnauthorizedPage;