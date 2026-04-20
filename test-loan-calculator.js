// 测试贷款计算器

// 测试案例
const testCases = [
    {
        name: "商业贷款 - 300万 - 30%首付 - 30年",
        price: 300, // 万元
        downRatio: 30, // 百分比
        term: 30, // 年
        type: "commercial"
    },
    {
        name: "公积金贷款 - 300万 - 30%首付 - 30年",
        price: 300,
        downRatio: 30,
        term: 30,
        type: "fund"
    },
    {
        name: "组合贷款 - 300万 - 30%首付 - 30年",
        price: 300,
        downRatio: 30,
        term: 30,
        type: "combination"
    }
];

// 计算贷款
function calculateLoan(price, downRatio, term, type) {
    // 计算贷款金额（转换为元）
    const loanAmountYuan = price * 10000 * (1 - downRatio / 100);
    const loanAmountWan = loanAmountYuan / 10000;
    
    // 利率设置（模拟）
    let rate = 0;
    switch(type) {
        case 'commercial':
            rate = 4.9 / 100 / 12; // 商业贷款
            break;
        case 'fund':
            rate = 3.25 / 100 / 12; // 公积金贷款
            break;
        case 'combination':
            rate = 4.0 / 100 / 12; // 组合贷款
            break;
    }
    
    // 计算月供（元）
    const monthlyPayment = loanAmountYuan * rate * Math.pow(1 + rate, term * 12) / (Math.pow(1 + rate, term * 12) - 1);
    
    // 计算总利息（万元）
    const totalInterestYuan = monthlyPayment * term * 12 - loanAmountYuan;
    const totalInterestWan = totalInterestYuan / 10000;
    
    return {
        loanAmountWan,
        monthlyPayment,
        totalInterestWan
    };
}

// 运行测试
console.log("贷款计算器测试结果：");
console.log("========================================");

testCases.forEach(testCase => {
    const result = calculateLoan(testCase.price, testCase.downRatio, testCase.term, testCase.type);
    console.log(`${testCase.name}:`);
    console.log(`  贷款金额: ${result.loanAmountWan.toFixed(0)}万元`);
    console.log(`  月供: ${result.monthlyPayment.toFixed(0)}元`);
    console.log(`  总利息: ${result.totalInterestWan.toFixed(2)}万元`);
    console.log("----------------------------------------");
});

// 手动计算验证
console.log("手动计算验证：");
console.log("========================================");

// 商业贷款 - 300万 - 30%首付 - 30年
const price = 300; // 万元
const downRatio = 30; // 百分比
const term = 30; // 年
const loanAmountYuan = price * 10000 * (1 - downRatio / 100);
const rate = 4.9 / 100 / 12;
const months = term * 12;

// 手动计算月供
const numerator = loanAmountYuan * rate * Math.pow(1 + rate, months);
const denominator = Math.pow(1 + rate, months) - 1;
const manualMonthlyPayment = numerator / denominator;

console.log(`商业贷款手动计算：`);
console.log(`  贷款金额: ${(loanAmountYuan / 10000).toFixed(0)}万元`);
console.log(`  月利率: ${(rate * 100).toFixed(6)}%`);
console.log(`  还款月数: ${months}`);
console.log(`  分子: ${numerator.toFixed(2)}`);
console.log(`  分母: ${denominator.toFixed(6)}`);
console.log(`  月供: ${manualMonthlyPayment.toFixed(0)}元`);
