import React from 'react';
// Import các component placeholder (bạn sẽ tạo sau)
import Header from '../components/Header/Header';
import Carousel from '../components/Carousel/Carousel';
// import OtherInfo from '../components/OtherInfo/OtherInfo';
import Story from '../components/Story/Story';
import BookingBanner from '../BookingBanner/BookingBanner';
import StaffTeam from '../components/StaffTeam/StaffTeam';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header: Logo, Top Menu, Login */}
      <Header />

      {/* Carousel: Phần slideshow */}
      <Carousel />

      {/* Other Information: Thông tin khác */}
      {/* <OtherInfo /> */}

      {/* Story: Phần kể chuyện */}
      <Story />
      <BookingBanner/>
      {/* Đội ngũ nhân viên: Grid boxes */}
      <StaffTeam />

      {/* Footer: Logo, Notification, List, Kết nối */}
      <Footer />
    </div>
  );
};

export default HomePage;