import React, { useEffect, useRef, useState } from 'react';
import myimg from "./assets/IMG_4548.JPG";

// =============================================================================
// CONSTELLATION BACKGROUND
// =============================================================================
const ConstellationBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.2 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const force = (150 - distance) / 150;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = `rgba(150, 150, 150, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesRef.current = Array.from({ length: 80 }, () => new Particle());
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => { p.update(); p.draw(); });
      // Connect
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dist = Math.hypot(particlesRef.current[i].x - particlesRef.current[j].x, particlesRef.current[i].y - particlesRef.current[j].y);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(150, 150, 150, ${(1 - dist / 150) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    const move = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// =============================================================================
// UTILS & HOOKS
// =============================================================================
const TypewriterText = ({ text, speed = 40, delay = 0, className = "" }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayed(text.substring(0, i + 1));
        i++;
        if (i === text.length) clearInterval(interval);
      }, speed);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return <span className={className}>{displayed}</span>;
};

const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);
  return [ref, isVisible];
};

// =============================================================================
// COMPONENTS
// =============================================================================

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-white/80 backdrop-blur-lg shadow-sm' : 'py-6 md:py-8 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-black tracking-tighter text-gray-900">HA<span className="text-blue-600">.</span></div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 lg:gap-10">
          {['Home', 'About', 'Education', 'Projects', 'Skills', 'Contact'].map(item => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-xs uppercase font-bold tracking-widest text-gray-500 hover:text-black transition-all group relative"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 w-7 h-7 justify-center items-center"
        >
          <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-full h-0.5 bg-gray-900 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-[72px] left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex flex-col py-4">
          {['Home', 'About', 'Education', 'Projects', 'Skills', 'Contact'].map(item => (
            <button 
              key={item} 
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm uppercase font-bold tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-all py-4 px-8 text-left"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 md:px-8 relative overflow-hidden pt-24 md:pt-20">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 md:gap-12 items-center z-10">
        <div className="order-2 lg:order-1 space-y-6 md:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-xs font-bold uppercase tracking-widest border border-blue-100">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Web Developer & Designer
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-[0.9]" style={{ fontFamily: "'Playfair Display', serif" }}>
            <TypewriterText text="Harshit" delay={200} /><br/>
            <span className="text-blue-600"><TypewriterText text="Aggarwal" delay={800} /></span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-md leading-relaxed mx-auto lg:mx-0">
            I craft immersive digital experiences where <span className="text-gray-900 font-medium italic">aesthetic design</span> meets <span className="text-gray-900 font-medium">functional code</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
            <button 
              onClick={() => scrollToSection('projects')}
              className="px-8 md:px-10 py-4 md:py-5 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300"
            >
              View Projects
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-8 md:px-10 py-4 md:py-5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              Contact Me
            </button>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex justify-center relative">
          <div className="relative w-full max-w-[300px] sm:max-w-[350px] md:max-w-[450px] aspect-[4/5] group">
            {/* Animated SVG Shape behind image */}
            <svg viewBox="0 0 200 200" className="absolute -top-10 -right-10 w-full h-full animate-[spin_30s_linear_infinite] opacity-10">
              <path fill="#2563EB" d="M45,-77C58.3,-70.3,69.1,-58.5,77.3,-45.1C85.5,-31.7,91.1,-16.7,89.5,-2.2C87.9,12.3,79.1,26.4,69.4,38.2C59.7,50,49,59.6,36.5,67.7C24,75.8,9.7,82.4,-4,89.3C-17.7,96.3,-30.9,103.5,-42.6,99.9C-54.3,96.3,-64.4,81.9,-71.4,68.2C-78.4,54.5,-82.3,41.5,-85.5,28.2C-88.7,14.9,-91.3,1.3,-89.6,-11.9C-87.9,-25.1,-82,-37.9,-72.7,-48.5C-63.4,-59.1,-50.7,-67.6,-37.7,-74.4C-24.7,-81.3,-11.4,-86.6,1.4,-89C14.2,-91.4,28.4,-90.9,45,-77Z" transform="translate(100 100)" />
            </svg>
            
            <div className="relative z-10 w-full h-full rounded-[40px] md:rounded-[60px] overflow-hidden border-8 md:border-[16px] border-white shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-700">
              <img src={myimg} alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
              <img src="./assets/IMG_4548.JPG" alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const [ref, visible] = useScrollReveal();
  return (
    <section id="about" ref={ref} className="py-20 md:py-32 px-4 md:px-8">
      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>About Me</h2>
        <div className="bg-white/50 backdrop-blur-xl p-6 md:p-12 rounded-[30px] md:rounded-[40px] border border-white shadow-sm leading-relaxed text-base md:text-xl text-gray-600 font-light">
          <p>
            Hi, I'm <span className="text-gray-900 font-bold">Harshit Aggarwal</span>, a B.Tech CSE student fueled by curiosity and coffee. I specialize in crafting digital products that don't just work—they feel intuitive. I bridge the gap between complex logic and minimalist design.
          </p>
        </div>
      </div>
    </section>
  );
};

const TimelineItem = ({ year, title, institution, logo, index, isLast }) => {
  const [ref, visible] = useScrollReveal();
  
  return (
    <div ref={ref} className="relative">
      {/* Mobile/Tablet: Vertical Timeline */}
      <div className="lg:hidden">
        <div className={`flex gap-6 transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
          {/* Timeline Line & Dot */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-blue-600 shadow-lg flex items-center justify-center overflow-hidden group hover:scale-110 transition-transform duration-300">
              <img src={logo} alt={institution} className="w-10 h-10 object-contain" />
            </div>
            {!isLast && <div className="w-1 flex-1 bg-gradient-to-b from-blue-600 to-blue-200 mt-4"></div>}
          </div>

          {/* Content */}
          <div className="flex-1 pb-12">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-blue-600 text-sm font-black uppercase tracking-widest mb-2">{year}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
              <p className="text-gray-600 text-sm font-medium">{institution}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block">
        <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
          {/* Content Above */}
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
            <div className="text-blue-600 text-sm font-black uppercase tracking-widest mb-2">{year}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
            <p className="text-gray-600 text-sm font-medium">{institution}</p>
          </div>

          {/* Timeline Dot & Logo */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-blue-600 shadow-lg flex items-center justify-center overflow-hidden group hover:scale-110 transition-transform duration-300 relative z-10">
              <img src={logo} alt={institution} className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Education = () => {
  const [ref, visible] = useScrollReveal();
  
  const educationData = [
    {
      year: "2021",
      title: "10th Grade",
      institution: "Saint Giri Sr. Sec. School",
      logo: "https://play-lh.googleusercontent.com/_2jrOYjoXag6mulSxqMU240b_2hWQemr3UBtyKLavlfTFz98rDrTooHXW0T_3TQRzA=w240-h480-rw" // Replace with actual logo path
    },
    {
      year: "2023",
      title: "12th Grade",
      institution: "Sarvodya Vidyalya Sec-3 Rohini",
      logo: "https://pbs.twimg.com/profile_images/1519193756783681536/Z0PwBJqD_400x400.jpg" // Replace with actual logo path
    },
    {
      year: "2023-27",
      title: "B.Tech CSE",
      institution: "Bhagwan Parshuram Institute of Technology",
      logo: "https://bpitindia.com/wp-content/uploads/2023/07/BPIT-logo.jpg" // Replace with actual logo path
    }
  ];

  return (
    <section id="education" className="py-20 md:py-32 px-4 md:px-8 bg-gray-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={ref} className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Education
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
            My academic journey and milestones
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-600 to-blue-200 -translate-y-1/2" style={{ top: 'calc(100% - 40px)' }}></div>
            
            {/* Timeline Items */}
            <div className="grid grid-cols-3 gap-8">
              {educationData.map((item, index) => (
                <TimelineItem
                  key={index}
                  {...item}
                  index={index}
                  isLast={index === educationData.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Timeline */}
        <div className="lg:hidden max-w-2xl mx-auto">
          {educationData.map((item, index) => (
            <TimelineItem
              key={index}
              {...item}
              index={index}
              isLast={index === educationData.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ title, tech, desc, delay }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={`group bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-12 md:w-16 h-1 bg-blue-600 mb-6 md:mb-8 rounded-full group-hover:w-20 md:group-hover:w-24 transition-all"></div>
      <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-4 md:mb-6">{tech}</p>
      <p className="text-gray-500 leading-relaxed mb-6 md:mb-10 text-sm md:text-base">{desc}</p>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <button className="px-5 md:px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">View Code</button>
        <button className="px-5 md:px-6 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Demo</button>
      </div>
    </div>
  );
};

const Projects = () => (
  <section id="projects" className="py-20 md:py-32 px-4 md:px-8 bg-gray-50/50">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-20 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Projects</h2>
      <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
        <ProjectCard title="Modern Todo App" tech="React • LocalStorage" desc="A productivity powerhouse with a focus on slick animations and data persistence." delay={100} />
        <ProjectCard title="Cinema Scout" tech="React • API • CSS" desc="A movie discovery engine fetching real-time data from the TMDB database with custom filters." delay={300} />
      </div>
    </div>
  </section>
);

const Skills = () => {
  const skills = ["React.js", "JavaScript", "Tailwind CSS", "UI/UX Design", "Problem Solving", "Git & Github"];
  return (
    <section id="skills" className="py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-20 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {skills.map((s, i) => (
            <div key={i} className="p-5 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-gray-100 text-center font-bold text-sm md:text-base text-gray-800 hover:border-blue-600 hover:text-blue-600 transition-all cursor-default shadow-sm hover:shadow-md">
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactCard = ({ icon, title, subtitle, link, delay, gradient }) => {
  const [ref, visible] = useScrollReveal();
  
  const handleClick = (e) => {
    if (link.startsWith('mailto:')) {
      // Let the browser handle mailto links naturally
      window.location.href = link;
    }
  };
  
  return (
    <a 
      href={link}
      onClick={link.startsWith('mailto:') ? handleClick : undefined}
      target={link.startsWith('http') ? '_blank' : undefined}
      rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
      ref={ref}
      className={`group relative overflow-hidden bg-white rounded-[30px] md:rounded-[40px] p-8 md:p-10 border border-gray-100 hover:border-transparent shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 group-hover:bg-white/20 flex items-center justify-center mb-6 md:mb-8 transition-all duration-500 group-hover:scale-110">
          <div className="text-3xl md:text-4xl">{icon}</div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-gray-900 group-hover:text-white transition-colors duration-500" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
        
        <p className="text-sm md:text-base text-gray-500 group-hover:text-white/80 transition-colors duration-500 font-medium">
          {subtitle}
        </p>

        {/* Arrow Icon */}
        <div className="mt-6 md:mt-8 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-200 group-hover:border-white flex items-center justify-center group-hover:bg-white/10 transition-all duration-500">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-all duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </a>
  );
};

const Contact = () => {
  const [ref, visible] = useScrollReveal();
  
  return (
    <section id="contact" className="py-20 md:py-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={ref} className={`text-center mb-12 md:mb-20 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Let's Connect
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-light max-w-2xl mx-auto">
            Available for new opportunities and collaborations. Feel free to reach out!
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <ContactCard 
            icon="💼"
            title="LinkedIn"
            subtitle="Let's connect professionally"
            link="https://www.linkedin.com/in/harshit-aggarwal-b32b66293/"
            delay={100}
            gradient="bg-gradient-to-br from-blue-600 to-blue-700"
          />
          
          <ContactCard 
            icon="📸"
            title="Instagram"
            subtitle="Follow my journey"
            link="https://www.instagram.com/harshit_aggarwal17?igsh=ajZ0NWliOHFqMzNx"
            delay={300}
            gradient="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600"
          />
          
          <ContactCard 
            icon="✉️"
            title="Email"
            subtitle="Drop me a message"
            link="mailto:aggarwalh424@gmail.com?subject=Inquiry from Portfolio"
            delay={500}
            gradient="bg-gradient-to-br from-gray-800 to-gray-900"
          />
        </div>

        {/* Optional CTA */}
        <div className={`text-center mt-12 md:mt-16 transition-all duration-1000 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Prefer traditional email? 
            <a href="mailto:aggarwalh424@gmail.com" className="text-blue-600 hover:text-blue-700 ml-2 underline underline-offset-4 decoration-2">
              aggarwalh424@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-8 md:py-12 border-t border-gray-100 text-center text-gray-400 text-xs font-bold uppercase tracking-widest px-4">
    © 2026 Harshit Aggarwal • Built with Passion
  </footer>
);

// =============================================================================
// MAIN APP
// =============================================================================
export default function App() {
  return (
    <div className="bg-[#fdfdfc] selection:bg-blue-100">
      <ConstellationBackground />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Education />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
