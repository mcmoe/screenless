
const somefunc = (thing, {caching = true} = {caching: true}) => {
    console.log(`${thing}, caching is: ${caching}`);
}
 
somefunc('hello', {caching: false}); // false
somefunc('hello', {}); // true
somefunc('hello', false); // true
somefunc('hello'); // true
