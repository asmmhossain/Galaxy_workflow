var History=Backbone.Model.extend(LoggableMixin).extend({defaults:{id:null,name:"Unnamed History",state:"new",diskSize:0,deleted:false},urlRoot:"api/histories/",url:function(){return this.urlRoot+this.get("id")},initialize:function(b,c,a){a=a||null;this.log(this+".initialize:",b,c);this.hdas=new HDACollection();if(c&&_.isArray(c)){this.hdas.reset(c);this.checkForUpdates();if(this.hdas.length>0){this.updateDisplayApplications()}}this.hdas.bind("state:ready",function(e,g,d){if(e.get("force_history_refresh")){var f=this;setTimeout(function(){f.stateUpdater()},History.UPDATE_DELAY)}},this);if(this.logger){this.bind("all",function(d){this.log(this+"",arguments)},this)}},hdaIdsFromStateIds:function(){return _.reduce(_.values(this.get("state_ids")),function(b,a){return b.concat(a)})},checkForUpdates:function(){if(this.hdas.running().length){this.stateUpdater()}else{this.trigger("ready")}return this},stateUpdater:function(){var c=this,a=this.get("state"),b=this.get("state_ids");jQuery.ajax("api/histories/"+this.get("id")).success(function(d){c.set(d);c.log("current history state:",c.get("state"),"(was)",a,"new size:",c.get("nice_size"));var e=[];_.each(_.keys(d.state_ids),function(g){var f=_.difference(d.state_ids[g],b[g]);e=e.concat(f)});if(e.length){c.fetchHdaUpdates(e)}if((c.get("state")===HistoryDatasetAssociation.STATES.RUNNING)||(c.get("state")===HistoryDatasetAssociation.STATES.QUEUED)){setTimeout(function(){c.stateUpdater()},History.UPDATE_DELAY)}else{c.trigger("ready")}}).error(function(g,d,e){if(g.status===502){setTimeout(function(){c.log("Bad Gateway error. Retrying...");c.stateUpdater()},History.UPDATE_DELAY)}else{if(!((g.readyState===0)&&(g.status===0))){c.log("stateUpdater error:",e,"responseText:",g.responseText);var f=_l("An error occurred while getting updates from the server.")+" "+_l("Please contact a Galaxy administrator if the problem persists.");c.trigger("error",f,g,d,e)}}})},fetchHdaUpdates:function(b){var a=this;jQuery.ajax({url:this.url()+"/contents?"+jQuery.param({ids:b.join(",")}),error:function(h,c,d){if((h.readyState===0)&&(h.status===0)){return}var f=JSON.parse(h.responseText);if(_.isArray(f)){var e=_.groupBy(f,function(i){if(_.has(i,"error")){return"errored"}return"ok"});a.log("fetched, errored datasets:",e.errored);a.updateHdas(f)}else{a.log("Error updating hdas from api history contents",b,h,c,d,f);var g=_l("An error occurred while getting dataset details from the server.")+" "+_l("Please contact a Galaxy administrator if the problem persists.");a.trigger("error",g,h,c,d)}},success:function(d,c,e){a.log(a+".fetchHdaUpdates, success:",c,e);a.updateHdas(d)}})},updateHdas:function(a){var c=this,b=[];c.log(c+".updateHdas:",a);_.each(a,function(e,f){var d=c.hdas.get(e.id);if(d){c.log("found existing model in list for id "+e.id+", updating...:");d.set(e)}else{c.log("NO existing model for id "+e.id+", creating...:");b.push(e)}});if(b.length){c.addHdas(b)}},addHdas:function(a){var b=this;_.each(a,function(c,d){var e=b.hdas.hidToCollectionIndex(c.hid);c.history_id=b.get("id");b.hdas.add(new HistoryDatasetAssociation(c),{at:e,silent:true})});b.hdas.trigger("add",a)},updateDisplayApplications:function(a){this.log(this+"updateDisplayApplications:",a);var c=this,b=(a&&_.isArray(a))?({hda_ids:a.join(",")}):({});c.log(this+": fetching display application data");jQuery.ajax("history/get_display_application_links",{data:b,success:function(e,d,f){c.hdas.set(e)},error:function(g,d,e){if(!((g.readyState===0)&&(g.status===0))){c.log("Error fetching display applications:",a,g,d,e);var f=_l("An error occurred while getting display applications from the server.")+" "+_l("Please contact a Galaxy administrator if the problem persists.");c.trigger("error",f,g,d,e)}}})},toString:function(){var a=(this.get("name"))?(","+this.get("name")):("");return"History("+this.get("id")+a+")"}});History.UPDATE_DELAY=4000;var HistoryCollection=Backbone.Collection.extend(LoggableMixin).extend({model:History,urlRoot:"api/histories"});