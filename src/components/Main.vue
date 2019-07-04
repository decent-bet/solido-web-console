<template>
  <div>
    <h1>DecentBet Contracts CLI - {{ network }}</h1>
    <h2>Address {{ address }}</h2>
    <h2>DBETs {{ DBETs }}</h2>
    <h2>VTHO {{ energy }}</h2>
    <h3>Open Chrome Inspector to access Solido CLI</h3>

    <h3>Type contracts or a contract name to start</h3>

    <v-layout>
      <p />
      <v-flex xs4 sm4 offset-sm4>
        <v-treeview
          :items="contractView"
          v-slot:prepend="{ item }"
          item-key="id"
          item-text="label"
          item-children="items"
          open-on-click
        >
         <span
              v-if="item.type"
            >
              {{ item.type }}
            </span>
        </v-treeview>
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
          <div v-if="isCompilationComplete === false">Errors while compiling, verify contract</div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="dialog = false">Import to contracts</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { BigNumber } from "bignumber.js";

import { setupSolido } from "./setupSolido";
import { utils } from "./utils";

import * as solcjs from "solc-js";

@Component
export default class Main extends Vue {
  readonly ETHER = 10 ** 18;

  to = "";
  amount: number = 0;
  energy: number = -1;
  DBETs: number = -1;
  network: string = "";
  address: string = "";
  contractCode: string = "";
  version: string = "";
  dialog: any = null;
  abi: any = {};
  isCompilationComplete: boolean = true;
  compileMessage: string = "";
  log = "";
  contractView: any[] = [];

  async transferDBET() {
    const $w = window as any;
    const tx = await $w.contracts.DBETVETToken.methods.transfer(
      this.to,
      new BigNumber(this.amount).multipliedBy(this.ETHER)
    );
    this.log = tx;
  }

  async handleCompile() {
    try {
      this.compileMessage = "";
      this.compileMessage = "Compiling...";
      const compiler = await solcjs(this.version);
      this.isCompilationComplete = true;

      const output = await compiler(this.contractCode);
      this.abi = output[0].abi;
      this.compileMessage = "ABI is ready";
      this.isCompilationComplete = true;
    } catch (e) {
      console.log(e);
      this.isCompilationComplete = false;
    }
  }

  async mounted() {
    const { releases } = await solcjs.versions();
    this.version = releases.find((i: any) => i.indexOf("v0.5.0-stable") > -1);

    const awaiter: any = (promiseFn: Promise<any>) => {
      promiseFn.then(console.log, console.log);
      return "promise executed";
    };

    const $w = window as any;
    $w.ETHER = this.ETHER;
    $w.awaiter = awaiter;
    $w.contracts = await setupSolido();
    $w.BigNumber = BigNumber;
    //    $w.contracts.helpers = utils($w.contracts);
    Object.keys($w.contracts).forEach(key => {
      $w[key] = $w.contracts[key];
    });

    if ($w.contracts.Quest.chainTag === "0x27") {
      this.network = "testnet";
    } else {
      this.network = "mainnet";
    }

    this.address = $w.contracts.Quest.defaultAccount;
    // this.energy = await $w.contracts.
    const data = await $w.contracts.DBETVETToken.methods.balanceOf(
      this.address
    );
    this.DBETs = new BigNumber(data.decoded["0"])
      .dividedBy(this.ETHER)
      .toNumber();

    this.loadContractTreeview($w.contracts);
  }

  loadChild(methods: any, events: any) {
    const getLeaf = (items: any, type: string) => {
      if (!items) return [];
      return Object.keys(items).map((key: string) => {
        const fn = items[key];
        return {
          id: key,
          label: key,
          type,
          fn
        };
      });
    };

    return [...getLeaf(methods, "method"), ...getLeaf(events, "event")];
  }

  loadContractTreeview(contracts: any) {
    const tree = Object.keys(contracts).map((key: string) => {
      const c = contracts[key];
      return {
        c,
        id: key,
        label: key,
        // get methods
        items: this.loadChild(c.methods, c.events)
      };
    });

    this.contractView = tree;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
