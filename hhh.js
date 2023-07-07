// function frequencySort(nums) {
//     var freq = [];

// const { count } = require("./model/categoryModel");

//     for (var i = 0; i < nums.length; i++) {
//       var num = nums[i];
//       if (freq[num]) {
//         freq[num]++;
//       } else {
//         freq[num] = 1;
//       }
//     }

// }
// var nums=[1,2,3,1,2]

// console.log(frequencySort(nums))
// var count
// var a=[1,1,2,2,3]
// for(i=0;i<a;i++)
// {
//     count=0
//     for(j=0;j<a;j++)
//     {
//         if(a[i]==a[j])
//         {
//             count++

//         }
//     }
// }
// console.log(count)
// function frequencySort(nums) {
//     const freq = [];

//     nums.forEach((x) => {
//       freq[x] = freq[x] ? freq[x] + 1 : 2;
//     });

//     nums.sort((a,b) => freq[b] - freq[a]);

//     return nums;
//   }

//   const nums = [2,3,1,3,2];
//   const sorted = frequencySort(nums);
//   console.log(sorted)

// function sum(arr)
// {

//     for(i=0;i<arr;i++)
//     {
//         for(j=i+1;j<arr;j++)
//         {
//             if(arr[i]===2*arr[j] && arr[j]===2*arr[i])
//             {
//                 return true
//             }
//         }
//     }
//     return false
// }
// const a=[10,2,5,3]
// console.log(sum(a))

// function anagram(a,b)
// {
//     string1=a.split('').sort().join('')
//     string2=b.split('').sort().join('')

// return string1==string2

// }
// const a="anagram"
// const b="nagaram"
// const result=anagram(a,b)
// console.log(result)

// function String(s,g)
// {
//     return s.split('').sort().join('')===g.split('').sort().join('')
// }
// const s="ab"
// const g="ba"
// console.log(String(s,g))

// function string(s, g) {
//     if (s.length !== g.length) {
//         return false; 
//     }

//     for (var i = s.length; i > 0; i--) {
//         if (s[i]==g[i]) {
//             return false;
//         }
//     }
    
//     return true;
// }

// const s = "ba";
// const g = "ab";
// console.log(string(s, g));


// function fibonacci(n)
// {
//     if(n<=1)
//     {
//         return n
//     }
//     return fibonacci(n-1)+fibonacci(n-2)
// }
// const s=2
// console.log(fibonacci(s))



// function strincpy(s,t)
// {
//     let current=0
//     for( i=0;i<s.length;i++)
//     {
//         current=t.indexOf(s[i])
//         if(current===-1)
//         {
//             return false
//         }
//         current++
//     }
//     return true
// }
// const s="abc"
// const t="ayyyyyyybc"
// console.log(strincpy(s,t))





// const strs=["flower","flow","flight"]

// function strings(strs)
// {
//  if(!strs||strs.length===0)
//  {
//     return "null"
//  }
//  let prefix=strs[0]
//  console.log(prefix,"preffff");
//  for(i=0;i<strs.length;i++)
//  {
//     console.log("strs.lentgh",strs.length);
//     while(strs[i].indexOf(prefix)!==0)
//     {
//         console.log(prefix);
//        prefix=prefix.substring(0,prefix.length-1)
//        console.log("prefixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",prefix);
//        if(prefix==="")
//        {
//            return "null"
//        }
//     }
//  }

//  return prefix

// }
// console.log(strings(strs))












// function fl(n,flower)
// {
//    let count=0
//   let length=flower.length
//    for(i=0;i<length;i++)
//    {
   
//       if(flower[i]===0 && (i===0 ||flower[i-1]===0)&& (i===flower.length||flower[i+1]===0))
//       flower[i]=1
//       count++
      
//    }
//    if(count===n)
//    {
//       return true
//    }else
//    {
//       return false

//    }
   

// }

// const flower=[1,0,0,0,1]
// const n=2
// console.log(fl(n,flower))



// function canPlaceFlowers(flowerbed, n) {
//    let count = 0;
//    for (let i = 0; i < flowerbed.length && count < n; i++) {
//      if (
//        flowerbed[i] === 0 && // Check if the current position is empty
//        (i === 0 || flowerbed[i - 1] === 0) && // Check if the previous position is empty (or it's the first position)
//        (i === flowerbed.length - 1 || flowerbed[i + 1] === 0) // Check if the next position is empty (or it's the last position)
//      ) {
//        flowerbed[i] = 1; // Plant a flower
//        count++; // Increment the count of planted flowers
//      }
//    }
 
//    return count === n; // Return true if we planted enough flowers, false otherwise
//  }
 
//  // Example usage:
//  const flowerbed = [1, 0, 0, 0, 1];
//  const n = 2;
//  const canPlant = canPlaceFlowers(flowerbed, n);
//  console.log(canPlant); // Output: true




//  function flowerbed(flower,n)
//  {
//    let count=0
//    for(let i=0;i<flower.length;i++)
//    {
//       if(flower[i]===0 && (i===0||flower[i-1]===0) && (i===0||flower[]))
//    }
//  }

// function sum(num) {
//     let count = 0;
//     while (num !== 0) {
//       if (num % 2 === 0) {
//         num =num/2
//       } else {
//         num =num-1
//       }
//       count++;
//     }
//     return count;
//   }
//   console.log(sum(14))
  



// let numbers=[7,5,6,8,3]
// let g=Math.min(...numbers)
// let s=Math.max(...numbers)

// function gcd(a, b) {
//   {
//     let temp = b;
//     b = a % b;;
//     a = temp;
//   }

//   return a;
  
// }
// let result=gcd(g,s)
// console.log(result);



