import React from 'react';
import { Carousel } from 'antd';

const CarouselComponent = () => {
  const onChange = (currentSlide) => {
    console.log(currentSlide);
  };

  // Danh sách slide với hình ảnh và nội dung
  const slides = [
    {
      key: '1',
      image: 'https://media.cooky.vn/images/blog-2016/nghe-thuat-trinh-bay-va-chup-anh-mon-an%208.jpg',
      title: 'Hương vị Pháp đích thực',
      description: 'Khám phá các món ăn tuyệt vời tại Maison de Flavors.',
    },
    {
      key: '2',
      image: 'https://media.istockphoto.com/id/1428412216/vi/anh/m%E1%BB%99t-%C4%91%E1%BA%A7u-b%E1%BA%BFp-nam-r%C3%B3t-n%C6%B0%E1%BB%9Bc-s%E1%BB%91t-v%C3%A0o-b%E1%BB%AFa-%C4%83n.jpg?s=612x612&w=0&k=20&c=XlkgdgWuZyFTHDHNcL1up-zsMZrQRfXQXqwGvrbyshc=',
      title: 'Ưu đãi đặc biệt',
      description: 'Giảm giá 20% cho thực khách mới!',
    },
    {
      key: '3',
      image: 'https://phongcachmoc.vn/upload/images/thiet-ke-nha-hang-au-23.JPG',
      title: 'Trải nghiệm ẩm thực',
      description: 'Thưởng thức bữa tối sang trọng với gia đình.',
    },
  ];

  // Style cho nội dung slide (overlay toàn phần)
  const contentStyle = {
    height: '100%', // Phủ toàn bộ chiều cao của slide
    width: '100%', // Phủ toàn bộ chiều rộng
    color: '#fff',
    lineHeight: 'normal',
    textAlign: 'center',
    background: 'rgba(0, 0, 0, 0.6)', // Tăng độ tối để text nổi bật hơn
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Đảm bảo overlay nằm trên ảnh
    top: 0,
    left: 0,
  };

  return (
    <Carousel afterChange={onChange} autoplay>
      {slides.map((slide) => (
        <div key={slide.key} className="relative h-96 md:h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div style={contentStyle}>
              <h3 className="text-3xl md:text-5xl font-sans font-bold mb-4 animate-fade-in">
                {slide.title}
              </h3>
              <p className="text-lg md:text-xl px-4 font-sans">{slide.description}</p>
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default CarouselComponent;