import { BigNumber } from 'bignumber.js';

export const utils = (contracts: any) => ({
  transferTokensTo: (toAddress: string, value: number) => new Promise(async (resolve, reject) => {
    const to = toAddress.toLowerCase();
    const { token } = contracts;

    const approve = await token.methods.approve(token.address, value);
    setTimeout(async () => {
      const transfer = await token.methods.transfer(
        to,
        new BigNumber(value).multipliedBy(10 ** 18),
      );
      resolve({ approve, transfer });
    }, 10000);
  }),
  grantAdmin: async (_admin: string) => {
    const isAdmin = await contracts.admin.methods.admins(_admin);
    if (!isAdmin) {
      console.log('Adding', _admin, 'as admin..');
      const tx = await contracts.admin.methods.addAdmin(_admin);
      console.log('Added', _admin, 'as admin. Tx:', tx);
    } else console.log(_admin, 'is already an admin');
  },
  batchMethod: async (methods: Array<{ methodFn: Connex.Thor.Method, params: any[] }>) => {
    const result = methods.map(item => item.methodFn.asClause(...item.params));
    return result;
  },
});
