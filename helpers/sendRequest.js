const sendRequest = ({ res, statusCode, message, data = null, ...params }) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  if (Object.keys(params).length > 0) {
    response.others = params;
  }
  res.status(statusCode).json(response);
};

module.exports = { sendRequest };
