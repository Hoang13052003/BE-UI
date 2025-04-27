import React from 'react';
import '../../styles/home/AnotherSection.scss'; // Import the SCSS file

const AnotherSection: React.FC = () => {
  return (
    <section className="another-section">
      <div className="another-section__svg-divider">
        <svg
          className="another-section__svg"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          version="1.1"
          viewBox="0 0 2560 100"
          x="0"
          y="0"
        >
          <polygon
            className="another-section__svg-polygon"
            points="2560 0 2560 100 0 100"
          ></polygon>
        </svg>
      </div>
      <div className="another-section__container">
        <div className="another-section__flex-items-center">
          <div className="another-section__image-column">
            <div className="another-section__card another-section__card--image">
              <img
                alt="..."
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80"
                className="another-section__card-image"
              />
              <blockquote className="another-section__blockquote">
                <svg
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 583 95"
                  className="another-section__blockquote-svg"
                >
                  <polygon
                    points="-30,95 583,95 583,65"
                    className="another-section__blockquote-polygon"
                  ></polygon>
                </svg>
                <h4 className="another-section__blockquote-heading">
                  Great for your awesome project
                </h4>
                <p className="another-section__blockquote-text">
                  Putting together a page has never been easier than matching
                  together pre-made components. From landing pages
                  presentation to login areas, you can easily customise and
                  built your pages.
                </p>
              </blockquote>
            </div>
          </div>

          <div className="another-section__content-column">
            <div className="another-section__flex-wrap">
              <div className="another-section__feature-item-column">
                <div className="another-section__feature-item">
                  <div className="another-section__feature-icon">
                    <i className="fas fa-sitemap"></i>
                  </div>
                  <h6 className="another-section__feature-heading">
                    CSS Components
                  </h6>
                  <p className="another-section__feature-text">
                    Notus NextJS comes with a huge number of Fully Coded CSS
                    components.
                  </p>
                </div>
                <div className="another-section__feature-item another-section__feature-item--last">
                  <div className="another-section__feature-icon">
                    <i className="fas fa-drafting-compass"></i>
                  </div>
                  <h6 className="another-section__feature-heading">
                    JavaScript Components
                  </h6>
                  <p className="another-section__feature-text">
                    We also feature many dynamic components for React,
                    NextJS, Vue and Angular.
                  </p>
                </div>
              </div>
              <div className="another-section__feature-item-column">
                <div className="another-section__feature-item mt-4">
                  <div className="another-section__feature-icon">
                    <i className="fas fa-newspaper"></i>
                  </div>
                  <h6 className="another-section__feature-heading">Pages</h6>
                  <p className="another-section__feature-text">
                    This extension also comes with 3 sample pages. They are
                    fully coded so you can start working instantly.
                  </p>
                </div>
                <div className="another-section__feature-item another-section__feature-item--last">
                  <div className="another-section__feature-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h6 className="another-section__feature-heading">
                    Documentation
                  </h6>
                  <p className="another-section__feature-text">
                    Built by developers for developers. You will love how
                    easy is to to work with Notus NextJS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="another-section__container another-section__container--overflow-hidden">
        <div className="another-section__flex-items-center">
          <div className="another-section__css-components-column">
            <div className="another-section__feature-icon another-section__feature-icon--large">
              <i className="fas fa-sitemap text-xl"></i>
            </div>
            <h3 className="another-section__css-components-heading">
              CSS Components
            </h3>
            <p className="another-section__css-components-text">
              Every element that you need in a product comes built in as a
              component. All components fit perfectly with each other and can
              have different colours.
            </p>
            <div className="another-section__tags-block">
              <span className="another-section__tag">
                Buttons
              </span>
              <span className="another-section__tag">
                Inputs
              </span>
              <span className="another-section__tag">
                Labels
              </span>
              <span className="another-section__tag">
                Menus
              </span>
              <span className="another-section__tag">
                Navbars
              </span>
              <span className="another-section__tag">
                Pagination
              </span>
              <span className="another-section__tag">
                Progressbars
              </span>
              <span className="another-section__tag">
                Typography
              </span>
            </div>
            <a
              href="https://www.creative-tim.com/learning-lab/tailwind/nextjs/alerts/notus?ref=nnjs-index"
              target="_blank"
              className="another-section__view-all-link"
            >
              View All{" "}
              <i className="fa fa-angle-double-right ml-1 leading-relaxed"></i>
            </a>
          </div>

          <div className="another-section__component-images-column">
            <div className="another-section__component-images-wrapper">
              <img
                alt="..."
                src="../../../public/img/component-btn.png"
                className="another-section__component-image another-section__component-image--btn"
              />
              <img
                alt="..."
                src="../../../public/img/component-profile-card.png"
                className="another-section__component-image another-section__component-image--profile-card"
              />
              <img
                alt="..."
                src="../../../public/img/component-info-card.png"
                className="another-section__component-image another-section__component-image--info-card"
              />
              <img
                alt="..."
                src="../../../public/img/component-info-2.png"
                className="another-section__component-image another-section__component-image--info-2"
              />
              <img
                alt="..."
                src="../../../public/img/component-menu.png"
                className="another-section__component-image another-section__component-image--menu"
              />
              <img
                alt="..."
                src="../../../public/img/component-btn-pink.png"
                className="another-section__component-image another-section__component-image--btn-pink"
              />
            </div>
          </div>
        </div>

        <div className="another-section__flex-items-center another-section__flex-items-center--pt-32">
          <div className="another-section__javascript-components-column">
            <div className="another-section__justify-center another-section__flex-wrap another-section__relative">
              <div className="another-section__framework-card-column">
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/svelte/alerts/notus?ref=vtw-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--red">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/svelte.jpg"
                    />
                    <p className="another-section__framework-text">
                      Svelte
                    </p>
                  </div>
                </a>
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/react/alerts/notus?ref=vtw-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--light-blue mt-8">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/react.jpg"
                    />
                    <p className="another-section__framework-text">
                      ReactJS
                    </p>
                  </div>
                </a>
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/nextjs/alerts/notus?ref=nnjs-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--blue-gray-700 mt-8">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/nextjs.jpg"
                    />
                    <p className="another-section__framework-text">
                      NextJS
                    </p>
                  </div>
                </a>
              </div>
              <div className="another-section__framework-card-column another-section__framework-card-column--lg-mt-16">
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/js/alerts/notus?ref=vtw-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--yellow">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/js.png"
                    />
                    <p className="another-section__framework-text">
                      JavaScript
                    </p>
                  </div>
                </a>
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/angular/alerts/notus?ref=vtw-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--red-700 mt-8">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/angular.jpg"
                    />
                    <p className="another-section__framework-text">
                      Angular
                    </p>
                  </div>
                </a>
                <a
                  href="https://www.creative-tim.com/learning-lab/tailwind/vue/alerts/notus?ref=vtw-index"
                  target="_blank"
                >
                  <div className="another-section__framework-card another-section__framework-card--emerald-500 mt-8">
                    <img
                      alt="..."
                      className="another-section__framework-image"
                      src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/logos/vue.jpg"
                    />
                    <p className="another-section__framework-text">
                      Vue.js
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="another-section__javascript-content-column">
            <div className="another-section__feature-icon another-section__feature-icon--large">
              <i className="fas fa-drafting-compass text-xl"></i>
            </div>
            <h3 className="another-section__javascript-heading">
              Javascript Components
            </h3>
            <p className="another-section__javascript-text">
              In order to create a great User Experience some components
              require JavaScript. In this way you can manipulate the elements
              on the page and give more options to your users.
            </p>
            <p className="another-section__javascript-text">
              We created a set of Components that are dynamic and come to help
              you.
            </p>
            <div className="another-section__tags-block">
              <span className="another-section__tag">
                Alerts
              </span>
              <span className="another-section__tag">
                Dropdowns
              </span>
              <span className="another-section__tag">
                Menus
              </span>
              <span className="another-section__tag">
                Modals
              </span>
              <span className="another-section__tag">
                Navbars
              </span>
              <span className="another-section__tag">
                Popovers
              </span>
              <span className="another-section__tag">
                Tabs
              </span>
              <span className="another-section__tag">
                Tooltips
              </span>
            </div>
            <a
              href="https://www.creative-tim.com/learning-lab/tailwind/nextjs/alerts/notus?ref=nnjs-index"
              target="_blank"
              className="another-section__view-all-link"
            >
              View all{" "}
              <i className="fa fa-angle-double-right ml-1 leading-relaxed"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="another-section__container another-section__container--pb-32 another-section__container--pt-48">
        <div className="another-section__flex-items-center">
          <div className="another-section__documentation-column">
            <div className="another-section__documentation-content">
              <div className="another-section__feature-icon another-section__feature-icon--large">
                <i className="fas fa-file-alt text-xl"></i>
              </div>
              <h3 className="another-section__documentation-heading">
                Complex Documentation
              </h3>
              <p className="another-section__documentation-text">
                This extension comes a lot of fully coded examples that help
                you get started faster. You can adjust the colors and also the
                programming language. You can change the text and images and
                you're good to go.
              </p>
              <ul className="another-section__documentation-list">
                <li className="another-section__documentation-list-item">
                  <div className="another-section__flex-items-center">
                    <div>
                      <span className="another-section__documentation-list-icon">
                        <i className="fas fa-fingerprint"></i>
                      </span>
                    </div>
                    <div>
                      <h4 className="another-section__documentation-list-heading">
                        Built by Developers for Developers
                      </h4>
                    </div>
                  </div>
                </li>
                <li className="another-section__documentation-list-item">
                  <div className="another-section__flex-items-center">
                    <div>
                      <span className="another-section__documentation-list-icon">
                        <i className="fab fa-html5"></i>
                      </span>
                    </div>
                    <div>
                      <h4 className="another-section__documentation-list-heading">
                        Carefully crafted code for Components
                      </h4>
                    </div>
                  </div>
                </li>
                <li className="another-section__documentation-list-item">
                  <div className="another-section__flex-items-center">
                    <div>
                      <span className="another-section__documentation-list-icon">
                        <i className="far fa-paper-plane"></i>
                      </span>
                    </div>
                    <div>
                      <h4 className="another-section__documentation-list-heading">
                        Dynamic Javascript Components
                      </h4>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="another-section__documentation-image-column">
            <img
              alt="..."
              className="another-section__documentation-image"
              style={{
                transform:
                  "scale(1) perspective(1040px) rotateY(-11deg) rotateX(2deg) rotate(2deg)",
              }}
              src="../../../public/img/documentation.png"
            />
          </div>
        </div>
      </div>

      <div className="another-section__justify-center another-section__text-center another-section__flex-wrap another-section__mt-24">
        <div className="another-section__example-pages-column">
          <h2 className="another-section__example-pages-heading">Beautiful Example Pages</h2>
          <p className="another-section__example-pages-text">
            Notus NextJS is a completly new product built using our past
            experience in web templates. Take the examples we made for you and
            start playing with them.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnotherSection;