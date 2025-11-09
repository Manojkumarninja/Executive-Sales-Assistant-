import ninjacartLogoImg from '../../assets/ninjacart-logo.png';

const NinjacartLogo = ({ className = "", size = "normal" }) => {
  // Size variants - increased size to compensate for whitespace in image
  const sizes = {
    small: { logo: "w-32 h-32" },
    normal: { logo: "w-48 h-48" },
    large: { logo: "w-64 h-64" }
  };

  const currentSize = sizes[size] || sizes.normal;

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {/* Logo Image - scaled up to crop whitespace */}
      <img
        src={ninjacartLogoImg}
        alt="Ninjacart Logo"
        className={`${currentSize.logo} object-cover scale-150`}
        style={{ objectPosition: 'center' }}
      />
    </div>
  );
};

export default NinjacartLogo;
