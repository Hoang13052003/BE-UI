// HomePageSection.tsx
import React from 'react';
import '../../styles/home/HeroSection.scss';
import { useNavigate } from 'react-router-dom';
import AnotherSection from './AnotherSection';

// const handleClick = () => {
    
//     navigate('/login');
// }

const HeroSection: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login');
    };

  return (
    <React.Fragment>
      <section className="Hero-section">
        <div className="Hero-section__container">
          <div className="Hero-section__content-wrapper">
            <div className="Hero-section__text-content">
              <h2 className="Hero-section__heading">
              Track your project progress anytime, anywhere.
              </h2>
              <p className="Hero-section__description">
              Stay informed with real-time updates on milestones, work hours, and recent activity from our team.
              </p>
              <div className="Hero-section__button-group">
                <a
                  onClick={handleClick}
                  target="_blank"
                  className="Hero-section__button Hero-section__button--primary"
                >
                  Get started
                </a>
              </div>
            </div>
          </div>
        </div>
        <img
          className="Hero-section__image"
          src="../../../public/img/pattern_nextjs.png"
          alt="..."
        />
      </section>
      <AnotherSection />
    </React.Fragment>
  );
};

export default HeroSection;