module.exports = async function (context) {
    context.bindings.queueOutItem = context.bindings.input;
    context.done();
}