import React from 'react';
import { BookOpen } from 'lucide-react'; // Icon để tăng tính sinh động, cần cài lucide-react

const Story = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        {/* Ảnh bên trái */}
        <div className="md:w-1/2 p-4">
          <img
            src="https://png.pngtree.com/thumb_back/fh260/background/20230425/pngtree-the-bar-of-a-whiskey-bar-with-a-lot-of-liquor-image_2510453.jpg"
            alt="Story"
            className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Text bên phải */}
        <div className="md:w-1/2 p-4">
          <h3 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-red-600 animate-fade-in">
            Hành Trình Ẩm Thực
          </h3>
          <div className="flex items-center mb-2">
            <BookOpen className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-m text-black-500 font-bold font-serif">EST in 2020</span>
          </div>
          <p className="text-black font-serif leading-relaxed max-h-[300px] overflow-hidden">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores, illo dolorem? Quo quam alias modi error, sint numquam, excepturi hic neque nesciunt voluptatem natus vel inventore aut praesentium quidem non.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Story;