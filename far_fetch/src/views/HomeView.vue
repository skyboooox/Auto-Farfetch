<script setup>

import product_list from '../components/product_list.vue'
</script>

<template>
  <main v-if="ready">
    <div class="setting">
      <div style="margin-right: 2rem;">关键词：
        <select v-model="selected" class="selecter">
          <option v-for="(selector, index) in selectors" :key="index" :value="selector">{{ selector }}</option>
        </select>
      </div>

      <div style="margin-right: 2rem;">{{ lastUpdate }} 秒前抓取</div>

      <div style="margin-right: 2rem;">共 {{ total }} 条</div>
      <div style="margin-right: 2rem;">{{ nextUpdate }} 秒后抓取</div>

      <button class="basicButton" @click="fetch_now()">立刻抓取此分类</button>

    </div>
    <div class="product_list" v-if="selected">
      <product_list v-for="(item, index) in product" :key="index" :sku="item" />
    </div>
    <div v-else>
      选择一个关键词
    </div>
  </main>
</template>
<script>
export default {
  data() {
    return {
      ready: false,
      lastUpdate: 0,
      nextUpdate:0,
      nextUpdate_timestamp:0,
      total: 0,
      selectors: [],
      selected: '',
      products: [],
      product: [],
      fetch_timestamp: 0,
      setting: {} // 用于存放设置

    }
  },
  watch: {
    selected: function (val) {
      // console.log(val)
      this.products.forEach((e, i) => {
        if (e.keyword == val) {
          // console.log("data",e.data[e.data.length-1].raw);
          this.product = e.data[e.data.length-1].raw;
          this.fetch_timestamp=e.data[e.data.length-1].timestamp
          this.total=e.data[e.data.length-1].raw.length;
        
        }
      });
      this.setting.keyword.forEach(e => {
        if (e.keyword == val.keyword) {
          // console.log("st",e);
          this.nextUpdate_timestamp=e.nextUpdate;
        }
      });
    }
  },
  computed: {

  },

  methods: {
    getsetting() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      // keyword = keyword.replace(/\s+/g, '+');
      fetch(`./setting`, requestOptions)
        .then(response => response.text())
        .then(result => {
          this.setting = JSON.parse(result);
          // console.log("setting", this.setting);
        })
        .catch(error => console.log('error', error));
    },
    getProducts() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      // keyword = keyword.replace(/\s+/g, '+');
      fetch(`./products`, requestOptions)
        .then(response => response.text())
        .then(result => {
          this.products = JSON.parse(result);
          // console.log("products", this.products);

          this.products.forEach((e, i) => {
            // console.log(e, i);
            this.selectors[i] = e.keyword;
          });
          if (!this.ready) {
            this.selected = this.selectors[0];

            this.ready = true;

          }
        })
        .catch(error => console.log('error', error));
    },
    fetch_now(){
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      fetch(`./fetch_now?keyword=${this.selected}`, requestOptions)
        .then(response => response.text())
        .then(result => {
          // console.log(result);
          this.getProducts();
        })
        .catch(error => console.log('error', error));
    }

  },
  created() {
    this.getsetting();
    this.getProducts();


  },
  mounted() {
    setInterval(() => {
      if (this.ready) {
        this.getProducts()
        this.lastUpdate = Math.floor((Date.now() - this.fetch_timestamp) / 1000);
        this.nextUpdate = Math.floor((this.nextUpdate_timestamp - Date.now()) / 1000);
        
      }
    }, 500);

  },
  updated() {

  }
}
</script>

<style scoped>
.product_list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.setting {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  color: #FFF;

  .selecter {
    font-size: 1rem;
    color: #FFF;
    background-color: #666666;
    border: none;
    border-radius: 0.3rem;
    padding: 0.2rem;

  }

}
.basicButton {
  font-size: 1rem;
  color: #FFF;
  background-color: #666666;
  border: none;
  border-radius: 0.3rem;
  padding: 0.2rem 1rem;
}
</style>
