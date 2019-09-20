const axios = require('axios')
const cheerio = require('cheerio');
const fs=require('fs');

const db = require('./db');

async function query(sql){
    await db.startTransaction()
    let data=await db.executeTransaction(sql,data)
    await db.stopTransaction()

    return data
}


//获取页面数据
async function indexSipder(){
    try {
        const res=await axios.get('https://www.adtekdata.com/newslist-1')
        const html=res.data
        let datas=indexParser(html)
        //console.log(datas)
        await indexProcessor(datas)
    } catch (error) {
        console.log('请求失败')  
    }
  
}

//处理数据
function indexParser(html){

    const $=cheerio.load(html)

    const articleContent=$('.pro_right')
    const lis=$(articleContent).find('ul>li')
    return lis.map((i,d)=>{
        //    const url=$(d).find('.list_left').children('a').attr('href')
        //    console.log(url)
        return{
            // url:$(d).find('.list_left').children('a').attr('href'),
            // img:'https://www.adtekdata.com'+$(d).find('.list_left').find('a>img').attr('src'),
            // title:$(d).find('.list_right').children('h3').text(),
            // content:$(d).find('.list_right').children('.case_detail').text()   
            url:$(d).find('a').attr('href') 
        }
    })
 
}

//存入数据库
async function indexProcessor(datas){
    //console.log(datas)
    //const arr=Array.from(datas)
    // for(let i=0;i<datas.length;i++){
    //     //console.log(datas.url)
    //     let rows = await query(`select * from product_list where url='${datas[i].url}'`)
    //    // console.log(rows)
    //      if(rows>0){
    //         await query(`update product_list set url='${datas[i].url}',img='${datas[i].img}',title='${datas[i].title}',content='${datas[i].content}' where ID='${rows[0].ID}'`)
    //     }else{
    //         await query(`insert into product_list (ID, url, img, title, content) values(0,'${datas[i].url}','${datas[i].img}','${datas[i].title}','${datas[i].content}')`)
    //       }
    // }

    //继续抓详情
    let arr=[]
    for(let i=0;i<datas.length;i++){
        //console.log(datas[i].url)

        const da=await detailSpider(datas[i].url)
        arr.push(da)
        
    }
    //console.log(arr)
     await detailProcessor(arr)

    
}

async function detailSpider(url){
    try {
        const res=await axios.get(url)
        const html=res.data
        let datas=detailParser(html)
        //console.log(datas)
        return datas
        //await detailProcessor(datas)
    } catch (error) {
        console.log('detail 请求失败')
    }
}

function detailParser(html){
    
    const $=cheerio.load(html)

    const articleContent=$('.pro_right')

    const detailContent=$('.pinfo')

    const new_article=$(detailContent).find('p, p>img')

    //const product_detail=$(detailContent).find('p, p>img')

    const content=[]
    new_article.map((i,d)=>{
        const text=$(d).text()
        //console.log(text)
        if(text){
            content.push(text)
        }else if(d.name==='img'){
            const src='https://www.adtekdata.com'+$(d).attr('src')
            content.push(src)
        }
    })
    
    //console.log(content)
    // const new_title=$(articleContent).find('.tit').text()
   
    // arr.push(new_title)
    
    // const new_time=$('.time').text()
    // arr.push(new_time)
    // console.log(arr)
    // const detail_content=content 
    
    return {
            new_title:$(articleContent).find('.tit').text(),
            new_time:$('.time').text(),
            detail_content:content     
           }

  
    
    


}

 async function detailProcessor(arr){

    for(let i=0;i<arr.length;i++){
        
        await query(`insert into new_list ( ID, new_title, new_time, deail_content ) values(0,'${arr[i].new_title}','${arr[i].new_time}','${arr[i].detail_content}')`)

    }
  
 }


(async ()=>{
    await indexSipder()
})()
 .then(r=>{
     process.exit(0)
 })
 .catch(e=>{
     console.log(e)
     process.exit(1)
 })