export default function Services() {
  const services = [
    { title: "Wedding Ceremony", icon: "flaticon-route" },
    { title: "City Transfer", icon: "flaticon-route" },
    { title: "Airport Transfer", icon: "flaticon-route" },
    { title: "Whole City Tour", icon: "flaticon-route" }
  ];

  return (
    <>
      {/* Hero Section */}
      <section 
        className="hero-wrap hero-wrap-2 js-fullheight" 
        style={{ backgroundImage: "url('/images/bg_3.jpg')", height: '100vh', backgroundSize: 'cover' }}
      >
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text js-fullheight align-items-end justify-content-start">
            <div className="col-md-9 pb-5">
              <p className="breadcrumbs">
                <span className="mr-2">
                  <a href="/">Home <i className="ion-ios-arrow-forward"></i></a>
                </span> 
                <span>Services <i className="ion-ios-arrow-forward"></i></span>
              </p>
              <h1 className="mb-3 bread">Our Services</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-7 text-center heading-section">
              <span className="subheading">Services</span>
              <h2 className="mb-3">Our Latest Services</h2>
            </div>
          </div>
          <div className="row">
            {services.map((service, index) => (
              <div key={index} className="col-md-3">
                <div className="services services-2 w-100 text-center">
                  <div className="icon d-flex align-items-center justify-content-center">
                    <span className={service.icon}></span>
                  </div>
                  <div className="text w-100">
                    <h3 className="heading mb-2">{service.title}</h3>
                    <p>A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver CTA Section */}
      <section className="ftco-section ftco-intro" style={{ backgroundImage: "url('/images/bg_3.jpg')", backgroundSize: 'cover' }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="row justify-content-end">
            <div className="col-md-6 heading-section heading-section-white">
              <h2 className="mb-3">Do You Want To Earn With Us? So Don't Be Late.</h2>
              <a href="#" className="btn btn-primary btn-lg">Become A Driver</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}