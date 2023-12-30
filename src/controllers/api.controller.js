// controllers/apiController.js
const { apiService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const faker = require('faker');

const createDynamicAPI = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { apiName, schema, workspaceId } = req.body;
  // Generate a schema without pagination
  await apiService.createDynamicAPI(apiName, schema, userId, workspaceId);
  res.status(201).send({ msg: 'Dynamic API created successfully', apiName });
});

const getAllDynamicAPIsUnderWorkspace = catchAsync(async (req, res) => {
  const workspaceId = req.params.workspaceId;
  console.log(workspaceId, 'workspaceId');

  const dynamicAPIs = await apiService.getDynamicAPIsByWorkspace(workspaceId);
  res.send(dynamicAPIs);
});

const getDynamicAPIDetail = catchAsync(async (req, res) => {
  const { apiName } = req.params;

  const data = await apiService.getDynamicAPI(apiName);

  if (!data) {
    return res.status(404).send({ msg: 'Dynamic API not found' });
  }

  res.send({ content: data });
});

const getDynamicAPI = catchAsync(async (req, res) => {
  const { apiName } = req.params;
  const { page, limit, sortBy, sortOrder, filters } = req.query || {};

  const api = await apiService.getDynamicAPI(apiName);

  if (!api) {
    return res.status(404).send({ msg: 'Dynamic API not found' });
  }
  let schema;

  if (page) {
    schema = Array.from({ length: 100 }, () => api.schema);
  } else {
    schema = api.schema;
  }

  const mockData = generateMockData(schema, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sortBy,
    sortOrder,
    filters,
  });

  // Respond with JSON
  res.json({ page, limit, length: mockData.length, content: mockData });
});

const generateMockDatum = (dataType) => {
  if (Array.isArray(dataType)) {
    // Handle an array of objects
    return dataType.map((itemType) => generateMockData(itemType));
  } else if (typeof dataType === 'object' && dataType !== null) {
    // Handle an object with nested schema
    return generateMockData(dataType);
  } else {
    // Handle basic data types
    switch (dataType) {
      case 'String':
        return faker.fake('{{lorem.word}}');
      case 'Number':
        return faker.fake('{{random.number}}');
      case 'Boolean':
        return faker.fake('{{random.boolean}}');
      case 'Date':
        return faker.fake('{{date.past}}');
      case 'Name':
        return faker.fake('{{name.findName}}');
      case 'URL':
        return faker.fake('{{internet.url}}');
      case 'Email':
        return faker.fake('{{internet.email}}');
      case 'Address':
        return faker.fake('{{address.streetAddress}}');
      case 'City':
        return faker.fake('{{address.city}}');
      case 'Country':
        return faker.fake('{{address.country}}');
      case 'Phone':
        return faker.fake('{{phone.phoneNumber}}');
      case 'Company':
        return faker.fake('{{company.companyName}}');
      case 'JobTitle':
        return faker.fake('{{name.jobTitle}}');
      case 'Text':
        return faker.fake('{{lorem.paragraph}}');
      case 'Paragraphs':
        return faker.fake('{{lorem.paragraphs}}');
      case 'Sentence':
        return faker.fake('{{lorem.sentence}}');
      case 'Color':
        return faker.fake('{{internet.color}}');
      case 'ImageURL':
        return faker.fake('{{image.imageUrl}}');
      case 'Word':
        return faker.fake('{{lorem.word}}');
      case 'UUID':
        return faker.fake('{{random.uuid}}');
      case 'Currency':
        return faker.fake('{{finance.currencyCode}}');
      case 'CreditCardNumber':
        return faker.fake('{{finance.creditCardNumber}}');
      case 'CreditCardType':
        return faker.fake('{{finance.creditCardType}}');
      case 'CreditCardExpirationDate':
        return faker.fake('{{finance.creditCardExpiry}}');
      case 'CreditCardCvv':
        return faker.fake('{{finance.creditCardCVV}}');
      case 'LoremPixelImage':
        return faker.fake('{{image.image}}');
      case 'ISBN':
        return faker.fake('{{random.uuid}}');
      case 'ISBN13':
        return faker.fake('{{random.uuid}}');
      case 'Latitude':
        return faker.fake('{{address.latitude}}');
      case 'Longitude':
        return faker.fake('{{address.longitude}}');
      case 'Word':
        return faker.fake('{{lorem.word}}');
      case 'Words':
        return faker.fake('{{lorem.words}}');
      case 'ArrayElement':
        return faker.fake('{{random.arrayElement}}');
      case 'FirstName':
        return faker.fake('{{name.firstName}}');
      case 'LastName':
        return faker.fake('{{name.lastName}}');
      case 'FullName':
        return faker.fake('{{name.firstName}} {{name.lastName}}');
      case 'Title':
        return faker.fake('{{name.title}}');
      case 'Suffix':
        return faker.fake('{{name.suffix}}');
      case 'Prefix':
        return faker.fake('{{name.prefix}}');
      case 'JobDescriptor':
        return faker.fake('{{name.jobDescriptor}}');
      case 'JobArea':
        return faker.fake('{{name.jobArea}}');
      case 'JobType':
        return faker.fake('{{name.jobType}}');
      case 'PhoneNumber':
        return faker.fake('{{phone.phoneNumber}}');
      case 'CompanySuffix':
        return faker.fake('{{company.companySuffix}}');
      case 'CatchPhrase':
        return faker.fake('{{company.catchPhrase}}');
      case 'Bs':
        return faker.fake('{{company.bs}}');
      case 'AccountNumber':
        return faker.fake('{{finance.account}}');
      case 'TransactionType':
        return faker.fake('{{finance.transactionType}}');
      case 'TransactionDescription':
        return faker.fake('{{finance.transactionDescription}}');
      case 'TransactionAmount':
        return faker.fake('{{finance.amount}}');
      case 'StreetAddress':
        return faker.fake('{{address.streetAddress}}');
      case 'ZipCode':
        return faker.fake('{{address.zipCode}}');
      case 'State':
        return faker.fake('{{address.state}}');
      case 'Sentence':
        return faker.fake('{{lorem.sentence}}');
      case 'Sentences':
        return faker.fake('{{lorem.sentences}}');
      case 'Slug':
        return faker.fake('{{lorem.slug}}');
      // Add more data types as needed
      default:
        return null;
    }
  }
};

const generateMockData = (schema, { page, limit, sortBy, sortOrder, filters } = {}) => {
  let data = {};
  if (Array.isArray(schema)) {
    // Handle an array of objects
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    data = schema.slice(startIndex, endIndex).map((itemType) => generateMockDatum(itemType));
  } else {
    // Generate mock data based on the specified data types
    Object.keys(schema).forEach((key) => {
      data[key] = generateMockDatum(schema[key]);
    });
  }

  // Add additional logic for sorting and filtering if needed

  return data;
};

module.exports = {
  createDynamicAPI,
  getDynamicAPI,
  getAllDynamicAPIsUnderWorkspace,
  getDynamicAPIDetail,
};
