const requestContext = (req, res, next) => {
  // Create a namespace for the current request
  global.requestContext = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    location: {
      city: req.headers['x-city'],
      country: req.headers['x-country'],
      coordinates: {
        latitude: req.headers['x-latitude'],
        longitude: req.headers['x-longitude']
      }
    },
    device: parseUserAgent(req.headers['user-agent'])
  };

  // Clean up after response is sent
  res.on('finish', () => {
    delete global.requestContext;
  });

  next();
};

const parseUserAgent = (userAgent) => {
  if (!userAgent) return {};

  const device = {
    type: 'unknown',
    os: 'unknown',
    browser: 'unknown'
  };

  // Simple device type detection
  if (/mobile/i.test(userAgent)) {
    device.type = 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    device.type = 'tablet';
  } else if (/windows|macintosh|linux/i.test(userAgent)) {
    device.type = 'desktop';
  }

  // OS detection
  if (/windows/i.test(userAgent)) {
    device.os = 'Windows';
  } else if (/macintosh|mac os/i.test(userAgent)) {
    device.os = 'MacOS';
  } else if (/linux/i.test(userAgent)) {
    device.os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    device.os = 'Android';
  } else if (/ios|iphone|ipad/i.test(userAgent)) {
    device.os = 'iOS';
  }

  // Browser detection
  if (/chrome/i.test(userAgent)) {
    device.browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    device.browser = 'Firefox';
  } else if (/safari/i.test(userAgent)) {
    device.browser = 'Safari';
  } else if (/edge/i.test(userAgent)) {
    device.browser = 'Edge';
  } else if (/opera/i.test(userAgent)) {
    device.browser = 'Opera';
  } else if (/msie|trident/i.test(userAgent)) {
    device.browser = 'Internet Explorer';
  }

  return device;
};

module.exports = requestContext; 