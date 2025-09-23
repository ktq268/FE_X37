import React from 'react';

const StaffTeam = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h3 className="text-3xl md:text-4xl font-bold font-serif mb-1 text-red-600">Đội ngũ nhân viên</h3>
        <h5 className="text-xl md:text-2xl  font-serif mb-1 text-black-600">Maison de Flavors</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 justify-items-center">
          {/* Box nhân viên 1 */}
          <div className="p-6 border border-gray-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <img
              src="https://www.shutterstock.com/image-photo/young-mexican-man-works-cook-600nw-2444462819.jpg"
              alt="Nhân viên 1"
              className="mx-auto rounded-full w-40 h-40 mb-6 object-cover"
            />
            <h4 className="text-xl font-bold text-gray-800">John Doe</h4>
            <p className="text-gray-600">Bếp trưởng</p>
          </div>
          {/* Box nhân viên 2 */}
          <div className="p-6 border border-gray-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <img
              src="https://media.istockphoto.com/id/923749250/vi/anh/n%E1%BB%AF-l%E1%BB%85-t%C3%A2n-l%C3%A0m-vi%E1%BB%87c-trong-kh%C3%A1ch-s%E1%BA%A1n.jpg?s=612x612&w=0&k=20&c=onWTSk7pRbefLuGrTQtzb-GeTIXFGtkuSs7U3z_lcA8="
              alt="Nhân viên 2"
              className="mx-auto rounded-full w-40 h-40 mb-6 object-cover"
            />
            <h4 className="text-xl font-bold text-gray-800">Jane Smith</h4>
            <p className="text-gray-600">Phục vụ trưởng</p>
          </div>
          {/* Box nhân viên 3 */}
          <div className="p-6 border border-gray-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <img
              src="https://images.careerviet.vn/content/images/01%20Binh%20MKT/Image%202.jpg"
              alt="Nhân viên 3"
              className="mx-auto rounded-full w-40 h-40 mb-6 object-cover"
            />
            <h4 className="text-xl font-bold text-gray-800">Maria Grale</h4>
            <p className="text-gray-600">Đầu bếp phụ</p>
          </div>
          {/* Box nhân viên 4 */}
          <div className="p-6 border border-gray-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <img
              src="https://img.pikbest.com/origin/10/21/56/63KpIkbEsTkmB.png!w700wp"
              alt="Nhân viên 4"
              className="mx-auto rounded-full w-40 h-40 mb-6 object-cover"
            />
            <h4 className="text-xl font-bold text-gray-800">Sam Wilson</h4>
            <p className="text-gray-600">Quản lý</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffTeam;