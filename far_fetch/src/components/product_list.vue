<script setup>

</script>

<template>
    <div class="sku">
        <img :src="sku.images.cutOut" @mouseover="changeImage" @mouseleave="restoreImg" ref="productImage">
        <div class="desp">
            <div style="color: #fff;" class="blockquote">{{ sku.brand.name }}</div>

            <div style="color: #ccc; ; " class="blockquote ableClick" @click="jumpURL(sku.url)">
                {{ sku.shortDescription }}</div>


            <div v-if="sku.gender == 'men'" style="  background-color: #81b3bf; color: #fff;" class="blockquote gender">男
            </div>
            <div v-if="sku.gender == 'women'" style="  background-color: #bf8d81; color: #fff" class="blockquote gender">女
            </div>
            <div v-if="sku.merchandiseLabel" style="color: #fff" class="blockquote">{{ sku.merchandiseLabel }}</div>

        </div>
        <div class="price">

            <div v-if="sku.priceInfo.discountLabel">
                <div class="blockquote">{{ sku.priceInfo.formattedInitialPrice }}</div>
                <div class="priceArrow"> <svg width="4rem" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                        data-v-ea893728="">
                        <path fill="currentColor"
                            d="M544 805.888V168a32 32 0 1 0-64 0v637.888L246.656 557.952a30.72 30.72 0 0 0-45.312 0 35.52 35.52 0 0 0 0 48.064l288 306.048a30.72 30.72 0 0 0 45.312 0l288-306.048a35.52 35.52 0 0 0 0-48 30.72 30.72 0 0 0-45.312 0L544 805.824z">
                        </path>
                    </svg>
                    <span style="font-size: 3rem; color: #fff;    text-shadow: 0px 0px 4px #ffffff;">{{
                        sku.priceInfo.discountLabel }}</span>
                </div>
                <div class="blockquote" style="background-color: #3b5e34;color: #FFF;">{{ sku.priceInfo.formattedFinalPrice
                }}
                </div>
            </div>
            <div v-else>
                <div class="blockquote" style="margin-top: 1rem; color: #fff;">{{ sku.priceInfo.formattedInitialPrice }}
                </div>
                <p class="blockquote" style="margin-top: 1rem; background-color: #6b6b6b; width: 11rem;">无折扣</p>
            </div>
        </div>
        <div class="size" v-if="sku.availableSizes">
            <span class="blockquote" v-for="size in sku.availableSizes"
                style="margin: 0.2rem 0rem; background-color: #3a4a63;">{{ size.size }}</span>
        </div>
        <div v-else class="size">
            <div class="blockquote" style="width: 8rem; margin-left: 1rem; background-color: #633a3a;">未抓取到尺码</div>
        </div>
        <div class="info">
            <div class="blockquote">总库存  {{ sku.stockTotal }}</div>
            <div class="blockquote" >ID  {{ sku.id }}</div>
            <div v-if="sku.timestamp" class="blockquote" >新增时间  {{ updateTime }}  </div>
        </div>


    </div>
</template>
<script>
export default {
    props: {
        sku: {
            type: Object,
            required: true
        }
    },
    computed: {
        updateTime() {
            // this.sku.timestamp
            let last = (Date.now() - this.sku.timestamp)/1000;
            console.log(last)
            if (last <  60) {
                return `${Math.floor(last)}秒前`
            }
            if (last < 60 * 60) {
                return `${Math.floor(last / 60)}分钟前`
            }
            if (last < 60 * 60 * 24) {
                return `${Math.floor(last / 60 / 60)}小时前`
            }
            if (last < 60 * 60 * 24 * 30) {
                return `${Math.floor(last / 60 / 60 / 24)}天前`
            }

        }
    },
    methods: {
        changeImage() {
            this.$refs.productImage.src = this.sku.images.model;
        },
        restoreImg() {
            this.$refs.productImage.src = this.sku.images.cutOut;

        },
        jumpURL(url) {
            window.open(`https://www.farfetch.cn${url}`)
        }
    },
    created() {
        // console.log(this.sku)
    }
}

</script>

<style scoped lang="less">
.sku {
    display: flex;
    margin: 1rem 0rem;
    height: 10rem;
    background-color: #8d8d8d;
    width: 80vw;
    border-radius: 1rem;
    box-shadow: 0px 0px 7px 4px #000000;

    >img {
        height: 10rem;

        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
    }

    .price {
        display: flex;
        align-items: center;
        margin-left: 1rem;
    }

    .desp {
        display: flex;
        /* background-color: #494949; */
        margin-left: 1rem;
        width: 20rem;
        word-break: break-all;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: flex-start;


    }

    .gender {

        height: 2rem;
    }

    .size {
        margin-left: 1rem;
        height: 10rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        min-width: 10rem;
        max-width: 20rem;
        align-content: space-around;
        flex-direction: column;
    }

    .info {
        display: flex;
        margin-left: 1rem;
        width: 15rem;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: flex-start;
    }

    .priceArrow {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0.5rem 0rem;
    }
}

.blockquote {
    background-color: #333;
    height: 2rem;
    padding: 0.2rem 0.8rem;
    border-radius: 0.4rem;
    text-align: center;
    box-shadow: 0px 0px 7px 2px #716d6d;

}

.ableClick {
    text-decoration: underline;
    cursor: pointer
}

::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background-color: #3b3b3b;
}

::-webkit-scrollbar-thumb {
    background-color: #979797;
}</style>
