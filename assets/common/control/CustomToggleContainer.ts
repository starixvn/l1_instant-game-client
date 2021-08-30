const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomToggleContainer extends cc.ToggleContainer {
    updateToggles(toggle) {
        if (!this.enabledInHierarchy) return;

        if (toggle.isChecked) {
            this.toggleItems.forEach(function (item) {
                if (item !== toggle && item.isChecked && item.enabled) {
                    item._hideCheckMark();
                    item.target.opacity = 100;
                }

                if (item.isChecked) {
                    item.target.opacity = 255;
                }
            });

            if (this.checkEvents) {
                cc.Component.EventHandler.emitEvents(this.checkEvents, toggle);
            }
        }
    }
}
