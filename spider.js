const axios = require('axios')
const cheerio = require('cheerio');
const fs=require('fs');

(async ()=>{
    const res=await axios.get('https://www.acfun.cn/a/ac11063673')
    const html=res.data

    const $=cheerio.load(html)

    const articleContent=$('.article-content')
    const doms=$(articleContent).find('p, p>img')
    //const doms=articleContent.children('p > img')
    //console.log(doms)
    const content=[]
    doms.map((i,d)=>{
        const text=$(d).text()
        if(text){
            content.push(text)
        }else if(d.name==='img'){
            const src=$(d).attr('src')
            content.push(src)
        }
        
    })
    console.log(content)
    // doms.map((i,d)=>{
    //     let text = $(d).text()
    //     console.log(text)
    // })
    
})()
 .then(r=>{
     process.exit(0)
 })
 .catch(e=>{
     console.log(e)
     process.exit(1)
 })