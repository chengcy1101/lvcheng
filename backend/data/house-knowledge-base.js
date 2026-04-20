// 杭州滨江区房源知识库

// 户型数据
const houseTypes = [
  {
    id: 1,
    name: "89㎡三室一厅",
    description: "紧凑实用的三室一厅户型，适合小家庭居住。南北通透，采光良好，客厅宽敞明亮。",
    price: "267万起",
    features: ["南北通透", "采光良好", "客厅宽敞", "主卧带飘窗"],
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20floor%20plan%2089sqm%20three%20bedrooms%20one%20living%20room&image_size=square_hd"
  },
  {
    id: 2,
    name: "110㎡三室两厅",
    description: "舒适型三室两厅户型，空间布局合理，功能分区明确。主卧带独立卫生间，客厅连接阳台。",
    price: "330万起",
    features: ["全明格局", "主卧带卫", "客厅阳台", "餐厅独立"],
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20floor%20plan%20110sqm%20three%20bedrooms%20two%20living%20rooms&image_size=square_hd"
  },
  {
    id: 3,
    name: "130㎡四室两厅",
    description: "豪华型四室两厅户型，适合大家庭居住。南北通透，双阳台设计，主卧套房带衣帽间。",
    price: "455万起",
    features: ["南北通透", "双阳台", "主卧套房", "独立衣帽间"],
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20floor%20plan%20130sqm%20four%20bedrooms%20two%20living%20rooms&image_size=square_hd"
  }
];

// 小区数据
const communities = [
  {
    id: 1,
    name: "绿城·春江明月",
    location: "杭州市滨江区长河街道",
    description: "绿城品质楼盘，位于滨江区核心位置，交通便利，配套完善。",
    facilities: ["健身房", "游泳池", "儿童乐园", "地下车库", "24小时安保"],
    nearby: ["地铁5号线长河站", "星光大道商圈", "滨江实验小学", "武警医院"],
    houses: [1, 2, 3]
  },
  {
    id: 2,
    name: "绿城·桂语江南",
    location: "杭州市滨江区西兴街道",
    description: "绿城高端系列，低密度社区，环境优美，适合居住。",
    facilities: ["私人会所", "园林景观", "运动场地", "智能安防"],
    nearby: ["地铁1号线西兴站", "龙湖天街", "江南实验学校", "浙二医院"]
  }
];

// 价格信息
const priceInfo = {
  averagePrice: "30000元/㎡",
  priceRange: "25000-35000元/㎡",
  paymentMethods: ["商业贷款", "公积金贷款", "组合贷款"],
  currentPromotions: [
    "首套首付30%起",
    "一次性付款享受98折优惠",
    "按时签约送家电大礼包"
  ]
};

// 贷款信息
const loanInfo = {
  commercialRate: "4.9%",
  fundRate: "3.25%",
  loanTerms: [10, 20, 30],
  example: {
    housePrice: 300,
    downPayment: 90,
    loanAmount: 210,
    loanTerm: 30,
    monthlyPayment: 11041
  }
};

// 区域优势
const areaAdvantages = [
  "滨江区是杭州的科技新区，阿里巴巴、网易等知名企业总部所在地",
  "交通便利，多条地铁线路经过，连接市区各个区域",
  "教育资源丰富，有多所优质学校",
  "商业配套完善，有星光大道、龙湖天街等大型商圈",
  "环境优美，滨江公园、钱塘江景观带等休闲场所"
];

// 销售政策
const salesPolicy = {
  reservation: "缴纳2万元定金锁定房源",
  signing: "7天内签订购房合同",
  delivery: "预计2024年12月交付",
  propertyFee: "3.5元/㎡/月",
  parkingFee: "300元/月"
};

// 搜索函数
function searchHouses(keyword) {
  keyword = keyword.toLowerCase();
  return houseTypes.filter(house => 
    house.name.toLowerCase().includes(keyword) ||
    house.description.toLowerCase().includes(keyword) ||
    house.features.some(feature => feature.toLowerCase().includes(keyword))
  );
}

function searchCommunities(keyword) {
  keyword = keyword.toLowerCase();
  return communities.filter(community => 
    community.name.toLowerCase().includes(keyword) ||
    community.location.toLowerCase().includes(keyword) ||
    community.description.toLowerCase().includes(keyword)
  );
}

function getHouseById(id) {
  return houseTypes.find(house => house.id === id);
}

function getCommunityById(id) {
  return communities.find(community => community.id === id);
}

// 导出模块
export {
  houseTypes,
  communities,
  priceInfo,
  loanInfo,
  areaAdvantages,
  salesPolicy,
  searchHouses,
  searchCommunities,
  getHouseById,
  getCommunityById
};