import React from 'react';

const BookingBanner = () => {
  // Style cho overlay và nội dung
  const overlayStyle = {
    height: '100%',
    width: '100%',
    color: '#fff',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7))', // Gradient fade từ trên xuống
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  };

  return (
    <section className="relative h-64 md:h-96">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      >
        <div style={overlayStyle}>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-2 text-yellow-400 animate-fade-in">
            Welcome to Maison de Flavors
          </h2>
          <h3 className="text-3xl md:text-xl font-thin font-sans mb-3 text-white animate-fade-in">Vui lòng đặt bàn để có trải nghiệm tốt nhất</h3>
          <button className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors duration-300">
            Đặt bàn
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingBanner;