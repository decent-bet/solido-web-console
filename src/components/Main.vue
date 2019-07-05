<template>
  <v-app dark>
    <v-navigation-drawer app overflow clipped floating>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>DBETs</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-list-tile-sub-title>{{ DBETs }}</v-list-tile-sub-title>
          </v-list-tile-action>
        </v-list-tile>

        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>VTHO</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-list-tile-sub-title>{{ energy }}</v-list-tile-sub-title>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Contracts</v-list-tile-title>
        </v-list-tile>
      </v-list>
      <v-treeview
        :items="contractView"
        v-slot:prepend="{ item }"
        item-key="id"
        item-text="label"
        item-children="items"
        open-on-click
      >
        <span v-if="item.type">{{ item.type }}</span>
      </v-treeview>
    </v-navigation-drawer>
    <v-toolbar app clipped-left>
      <v-btn flat large color="transparent">
        <img width="50" src="@/assets/logo.png" contain />
      </v-btn>
      <v-toolbar-title>DecentBet Contracts CLI - {{ network }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat>Address: {{ address }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <v-layout>
          <v-flex>
            <v-card>
              <v-list>
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon color="white">star</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    <v-list-tile-title>
                      Open Chrome Inspector to access Solido CLI
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon color="white">star</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    <v-list-tile-title>
                      Type contracts or a contract name to start
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </v-layout>
        <v-dialog v-model="dialog" width="500">
          <template v-slot:activator="{ on }">
            <!-- <v-btn color="blue lighten-2" dark v-on="on">Add contract</v-btn> -->
          </template>
          <v-card>
            <v-card-title class="headline blue" primary-title>Add Contract</v-card-title>
            <v-card-text>
              <v-textarea
                box
                label="v0.5.0"
                name="contractCode"
                v-model="contractCode"
                @change="handleCompile"
              ></v-textarea>
              <div v-if="isCompilationComplete">{{ compileMessage }}</div>
              <div v-if="isCompilationComplete === false">
                Errors while compiling, verify contract
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="dialog = false">
                Import to contracts
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>
    <v-footer app></v-footer>
  </v-app>
</template>

<script lang="ts">
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getLeaf"] }] */

import { Component, Prop, Vue } from 'vue-property-decorator';
import { BigNumber } from 'bignumber.js';

import * as solcjs from 'solc-js';
import { setupSolido } from './setupSolido';
import { utils } from './utils';

@Component
export default class Main extends Vue {
  readonly ETHER = 10 ** 18;

  to = '';

  amount: number = 0;

  energy: number = -1;

  DBETs: number = -1;

  network: string = '';

  address: string = '';

  contractCode: string = '';

  version: string = '';

  dialog: any = null;

  abi: any = {};

  isCompilationComplete: boolean = true;

  compileMessage: string = '';

  log = '';

  contractView: any[] = [];

  async transferDBET() {
    const $w = window as any;
    const tx = await $w.contracts.DBETVETToken.methods.transfer(
      this.to,
      new BigNumber(this.amount).multipliedBy(this.ETHER),
    );
    this.log = tx;
  }

  async handleCompile() {
    try {
      this.compileMessage = '';
      this.compileMessage = 'Compiling...';
      const compiler = await solcjs(this.version);
      this.isCompilationComplete = true;

      const output = await compiler(this.contractCode);
      this.abi = output[0].abi;
      this.compileMessage = 'ABI is ready';
      this.isCompilationComplete = true;
    } catch (e) {
      console.log(e);
      this.isCompilationComplete = false;
    }
  }

  async mounted() {
    const { releases } = await solcjs.versions();
    this.version = releases.find((i: any) => i.indexOf('v0.5.0-stable') > -1);

    const awaiter: any = (promiseFn: Promise<any>) => {
      promiseFn.then(console.log, console.log);
      return 'promise executed';
    };

    const $w = window as any;
    $w.ETHER = this.ETHER;
    $w.awaiter = awaiter;
    $w.contracts = await setupSolido();
    $w.BigNumber = BigNumber;
    //    $w.contracts.helpers = utils($w.contracts);
    Object.keys($w.contracts).forEach((key) => {
      $w[key] = $w.contracts[key];
    });

    if ($w.contracts.Quest.chainTag === '0x27') {
      this.network = 'testnet';
    } else {
      this.network = 'mainnet';
    }

    this.address = $w.contracts.Quest.defaultAccount;
    // this.energy = await $w.contracts.
    const data = await $w.contracts.DBETVETToken.methods.balanceOf(
      this.address,
    );
    this.DBETs = new BigNumber(data.decoded['0'])
      .dividedBy(this.ETHER)
      .toNumber();

    this.loadContractTreeview($w.contracts);
  }

  getLeaf(items: any, type: string) {
    if (!items) return [];
    return Object.keys(items).map((key: string) => {
      const fn = items[key];
      return {
        id: key,
        label: key,
        type,
        fn,
      };
    });
  }

  loadChild(methods: any, events: any) {
    return [
      ...this.getLeaf(methods, 'method'),
      ...this.getLeaf(events, 'event'),
    ];
  }

  loadContractTreeview(contracts: any) {
    const tree = Object.keys(contracts).map((key: string) => {
      const c = contracts[key];
      return {
        c,
        id: key,
        label: key,
        // get methods
        items: this.loadChild(c.methods, c.events),
      };
    });

    this.contractView = tree;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
