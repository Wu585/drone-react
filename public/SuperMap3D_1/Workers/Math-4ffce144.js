define(["exports","./Check-737bd4ec","./when-7d8885d2"],(function(t,n,i){"use strict";
/**
  @license
  mersenne-twister.js - https://gist.github.com/banksean/300494

     Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
     All rights reserved.

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions
     are met:

       1. Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.

       2. Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.

       3. The names of its contributors may not be used to endorse or promote
          products derived from this software without specific prior written
          permission.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */var a=function(t){null==t&&(t=(new Date).getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(t)};a.prototype.init_genrand=function(t){for(this.mt[0]=t>>>0,this.mti=1;this.mti<this.N;this.mti++){t=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(1812433253*((4294901760&t)>>>16)<<16)+1812433253*(65535&t)+this.mti,this.mt[this.mti]>>>=0}},a.prototype.genrand_int32=function(){var t,n=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var i;for(this.mti==this.N+1&&this.init_genrand(5489),i=0;i<this.N-this.M;i++)t=this.mt[i]&this.UPPER_MASK|this.mt[i+1]&this.LOWER_MASK,this.mt[i]=this.mt[i+this.M]^t>>>1^n[1&t];for(;i<this.N-1;i++)t=this.mt[i]&this.UPPER_MASK|this.mt[i+1]&this.LOWER_MASK,this.mt[i]=this.mt[i+(this.M-this.N)]^t>>>1^n[1&t];t=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^t>>>1^n[1&t],this.mti=0}return t=this.mt[this.mti++],t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,(t^=t>>>18)>>>0},a.prototype.random=function(){return this.genrand_int32()*(1/4294967296)};var e={EPSILON1:.1,EPSILON2:.01,EPSILON3:.001,EPSILON4:1e-4,EPSILON5:1e-5,EPSILON6:1e-6,EPSILON7:1e-7,EPSILON8:1e-8,EPSILON9:1e-9,EPSILON10:1e-10,EPSILON11:1e-11,EPSILON12:1e-12,EPSILON13:1e-13,EPSILON14:1e-14,EPSILON15:1e-15,EPSILON16:1e-16,EPSILON17:1e-17,EPSILON18:1e-18,EPSILON19:1e-19,EPSILON20:1e-20,EPSILON21:1e-21,GRAVITATIONALPARAMETER:3986004418e5,SOLAR_RADIUS:6955e5,LUNAR_RADIUS:1737400,SIXTY_FOUR_KILOBYTES:65536};e.sign=i.defaultValue(Math.sign,(function(t){return 0===(t=+t)||t!=t?t:t>0?1:-1})),e.signNotZero=function(t){return t<0?-1:1},e.toSNorm=function(t,n){return n=i.defaultValue(n,255),Math.round((.5*e.clamp(t,-1,1)+.5)*n)},e.fromSNorm=function(t,n){return n=i.defaultValue(n,255),e.clamp(t,0,n)/n*2-1},e.normalize=function(t,n,i){return 0===(i=Math.max(i-n,0))?0:e.clamp((t-n)/i,0,1)},e.sinh=i.defaultValue(Math.sinh,(function(t){return(Math.exp(t)-Math.exp(-t))/2})),e.cosh=i.defaultValue(Math.cosh,(function(t){return(Math.exp(t)+Math.exp(-t))/2})),e.lerp=function(t,n,i){return(1-i)*t+i*n},e.PI=Math.PI,e.ONE_OVER_PI=1/Math.PI,e.PI_OVER_TWO=Math.PI/2,e.PI_OVER_THREE=Math.PI/3,e.PI_OVER_FOUR=Math.PI/4,e.PI_OVER_SIX=Math.PI/6,e.THREE_PI_OVER_TWO=3*Math.PI/2,e.TWO_PI=2*Math.PI,e.ONE_OVER_TWO_PI=1/(2*Math.PI),e.RADIANS_PER_DEGREE=Math.PI/180,e.DEGREES_PER_RADIAN=180/Math.PI,e.RADIANS_PER_ARCSECOND=e.RADIANS_PER_DEGREE/3600,e.toRadians=function(t){return t*e.RADIANS_PER_DEGREE},e.toDegrees=function(t){return t*e.DEGREES_PER_RADIAN},e.convertLongitudeRange=function(t){var n=e.TWO_PI,i=t-Math.floor(t/n)*n;return i<-Math.PI?i+n:i>=Math.PI?i-n:i},e.clampToLatitudeRange=function(t){return e.clamp(t,-1*e.PI_OVER_TWO,e.PI_OVER_TWO)},e.negativePiToPi=function(t){return e.zeroToTwoPi(t+e.PI)-e.PI},e.zeroToTwoPi=function(t){var n=e.mod(t,e.TWO_PI);return Math.abs(n)<e.EPSILON14&&Math.abs(t)>e.EPSILON14?e.TWO_PI:n},e.mod=function(t,n){return(t%n+n)%n},e.equalsEpsilon=function(t,n,a,e){e=i.defaultValue(e,a);var r=Math.abs(t-n);return r<=e||r<=a*Math.max(Math.abs(t),Math.abs(n))},e.lessThan=function(t,n,i){return t-n<-i},e.lessThanOrEquals=function(t,n,i){return t-n<i},e.greaterThan=function(t,n,i){return t-n>i},e.greaterThanOrEquals=function(t,n,i){return t-n>-i};var r=[1];e.factorial=function(t){var n=r.length;if(t>=n)for(var i=r[n-1],a=n;a<=t;a++){var e=i*a;r.push(e),i=e}return r[t]},e.incrementWrap=function(t,n,a){return a=i.defaultValue(a,0),++t>n&&(t=a),t},e.isPowerOfTwo=function(t){return 0!==t&&0==(t&t-1)},e.nextPowerOfTwo=function(t){return--t,t|=t>>1,t|=t>>2,t|=t>>4,t|=t>>8,t|=t>>16,++t},e.clamp=function(t,n,i){return t<n?n:t>i?i:t};var h=new a;e.setRandomNumberSeed=function(t){h=new a(t)},e.nextRandomNumber=function(){return h.random()},e.randomBetween=function(t,n){return e.nextRandomNumber()*(n-t)+t},e.acosClamped=function(t){return Math.acos(e.clamp(t,-1,1))},e.asinClamped=function(t){return Math.asin(e.clamp(t,-1,1))},e.chordLength=function(t,n){return 2*n*Math.sin(.5*t)},e.logBase=function(t,n){return Math.log(t)/Math.log(n)},e.cbrt=i.defaultValue(Math.cbrt,(function(t){var n=Math.pow(Math.abs(t),1/3);return t<0?-n:n})),e.log2=i.defaultValue(Math.log2,(function(t){return Math.log(t)*Math.LOG2E})),e.fog=function(t,n){var i=t*n;return 1-Math.exp(-i*i)},e.fastApproximateAtan=function(t){return t*(-.1784*Math.abs(t)-.0663*t*t+1.0301)},e.fastApproximateAtan2=function(t,n){var i,a,r=Math.abs(t);i=Math.abs(n),a=Math.max(r,i);var h=(i=Math.min(r,i))/a;return r=e.fastApproximateAtan(h),r=Math.abs(n)>Math.abs(t)?e.PI_OVER_TWO-r:r,r=t<0?e.PI-r:r,r=n<0?-r:r},t.CesiumMath=e}));
