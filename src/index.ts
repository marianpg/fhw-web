import Buzzy from 'buzzy'

/* 
    some place here for custom configuration
*/

export default Buzzy

module.exports = Buzzy
module.exports.default = Buzzy

export {
    Config,
    DefaultConfig,

    Controller,
    ControllerFunction,
    EmptyResult,
    TextResult,
    JsonResult,
    RedirectResult,
    PageResult,
    FragmentResult,

    Helper,

    Route,
    DefaultMethod
} from 'buzzy'