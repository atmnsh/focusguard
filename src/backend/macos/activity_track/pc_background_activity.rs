use core_foundation::array::CFArray;
use core_foundation::base::TCFType;
use core_foundation::dictionary::CFDictionary;
use core_foundation::string::CFString;
use core_graphics::display::{
    kCGNullWindowID, kCGWindowListOptionOnScreenOnly, CGWindowListCopyWindowInfo,
    CGWindowListOption,
};

fn main() {
    let window_list = unsafe {
        CGWindowListCopyWindowInfo(
            CGWindowListOption::from_bits_truncate(kCGWindowListOptionOnScreenOnly),
            kCGNullWindowID,
        )
    };
    let windows = unsafe { CFArray::wrap_under_create_rule(window_list) };

    for i in 0..windows.len() {
        let dict = windows
            .get(i)
            .unwrap()
            .downcast::<CFDictionary>()
            .expect("Expected CFDictionary per window");

        let owner_name_key = CFString::new("kCGWindowOwnerName");
        let window_name_key = CFString::new("kCGWindowName");
        let owner_name: Option<CFString> = dict.get(&owner_name_key);
        let window_name: Option<CFString> = dict.get(&window_name_key);
        if let (Some(owner), Some(name)) = (owner_name, window_name) {
            println!("{}: {}", owner.to_string(), name.to_string());
        } else if let Some(owner) = owner_name {
            println!("{}: (untitled)", owner.to_string());
        }
    }
}
