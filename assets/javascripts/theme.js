$(document).ready(function(){
	var plusClass = ".plus";
	var minusClass = ".minus";
	$(plusClass).on("click",function(){
		var self = $(this);
		self.siblings('.text-more').show()
		self.hide()
		$(minusClass).show();
	});

	$(minusClass).on("click",function(){
		var self = $(this);
		self.siblings('.text-more').hide()
		self.hide()
		$(plusClass).show();
	});
})